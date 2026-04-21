import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/access-control";
import { deleteProject, getProject, listProjects, saveProject } from "@/lib/project-store";

const projectSchema = z.object({
  id: z.string().min(3).optional(),
  name: z.string().min(3).max(120),
  language: z.string().min(2).max(40).default("typescript"),
  content: z.string().min(1)
});

function getSessionEmail(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const payload = verifyAccessToken(token);
  return payload?.email ?? null;
}

export async function GET(request: NextRequest) {
  const email = getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const project = await getProject(email, id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  }

  const projects = await listProjects(email);
  return NextResponse.json({
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      language: project.language,
      updatedAt: project.updatedAt
    }))
  });
}

export async function POST(request: NextRequest) {
  const email = getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project payload." },
      { status: 400 }
    );
  }

  const projectId = parsed.data.id ?? crypto.randomUUID();
  const project = await saveProject(email, {
    id: projectId,
    name: parsed.data.name,
    language: parsed.data.language,
    content: parsed.data.content
  });

  return NextResponse.json({ project }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const email = getSessionEmail(request);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Project id is required." }, { status: 400 });
  }

  const deleted = await deleteProject(email, id);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
