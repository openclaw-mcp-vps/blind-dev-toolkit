import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_COOKIE_NAME,
  createAccessToken,
  verifyAccessToken
} from "@/lib/access-control";
import { hasActiveEntitlement } from "@/lib/lemonsqueezy";

const verifySchema = z.object({
  email: z.string().email()
});

function cookieSecurityOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const payload = verifyAccessToken(token);

  return NextResponse.json({
    authenticated: Boolean(payload),
    email: payload?.email ?? null
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid purchase email." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const hasAccess = await hasActiveEntitlement(email);

  if (!hasAccess) {
    return NextResponse.json(
      {
        error:
          "No active subscription was found for this email yet. Complete Stripe checkout first, then try again."
      },
      { status: 402 }
    );
  }

  const token = createAccessToken(email);
  const response = NextResponse.json({ authenticated: true, email });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    ...cookieSecurityOptions()
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0
  });

  return response;
}
