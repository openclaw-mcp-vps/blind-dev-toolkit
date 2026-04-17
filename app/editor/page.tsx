import type { Metadata } from "next";
import Link from "next/link";
import { AccessibleEditor } from "@/components/AccessibleEditor";

export const metadata: Metadata = {
  title: "Editor | Blind Dev Toolkit",
  description: "Code editor with synchronized speech output, line-by-line narration, and keyboard-first controls."
};

export default function EditorPage() {
  return (
    <main className="container py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title text-3xl">Voice-Guided Coding Editor</h1>
          <p className="mt-2 max-w-2xl text-[#9ba7b4]">
            Write and review code with immediate spoken context, stable keyboard shortcuts, and screen-reader-friendly structure.
          </p>
        </div>
        <nav className="flex gap-3 text-sm">
          <Link href="/dashboard" className="rounded-md border border-[#30363d] px-3 py-2 hover:bg-[#21262d]">
            Dashboard
          </Link>
          <Link href="/" className="rounded-md border border-[#30363d] px-3 py-2 hover:bg-[#21262d]">
            Home
          </Link>
        </nav>
      </header>

      <AccessibleEditor />
    </main>
  );
}
