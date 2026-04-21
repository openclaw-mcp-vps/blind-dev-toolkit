import { promises as fs } from "node:fs";
import path from "node:path";

export type ProjectRecord = {
  id: string;
  ownerEmail: string;
  name: string;
  language: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectsStore = {
  projects: ProjectRecord[];
};

const storePath = path.join(process.cwd(), ".data", "projects.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    const initial: ProjectsStore = { projects: [] };
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as ProjectsStore;
}

async function writeStore(store: ProjectsStore) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function listProjects(ownerEmail: string) {
  const normalized = ownerEmail.trim().toLowerCase();
  const store = await readStore();

  return store.projects
    .filter((project) => project.ownerEmail === normalized)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function getProject(ownerEmail: string, id: string) {
  const normalized = ownerEmail.trim().toLowerCase();
  const store = await readStore();

  return (
    store.projects.find(
      (project) => project.id === id && project.ownerEmail === normalized
    ) ?? null
  );
}

export async function saveProject(
  ownerEmail: string,
  input: {
    id: string;
    name: string;
    language: string;
    content: string;
  }
) {
  const normalized = ownerEmail.trim().toLowerCase();
  const store = await readStore();
  const now = new Date().toISOString();

  const existingIndex = store.projects.findIndex(
    (project) => project.id === input.id && project.ownerEmail === normalized
  );

  if (existingIndex >= 0) {
    store.projects[existingIndex] = {
      ...store.projects[existingIndex],
      name: input.name,
      language: input.language,
      content: input.content,
      updatedAt: now
    };

    await writeStore(store);
    return store.projects[existingIndex];
  }

  const created: ProjectRecord = {
    id: input.id,
    ownerEmail: normalized,
    name: input.name,
    language: input.language,
    content: input.content,
    createdAt: now,
    updatedAt: now
  };

  store.projects.push(created);
  await writeStore(store);
  return created;
}

export async function deleteProject(ownerEmail: string, id: string) {
  const normalized = ownerEmail.trim().toLowerCase();
  const store = await readStore();
  const before = store.projects.length;

  store.projects = store.projects.filter(
    (project) => !(project.id === id && project.ownerEmail === normalized)
  );

  if (store.projects.length === before) {
    return false;
  }

  await writeStore(store);
  return true;
}
