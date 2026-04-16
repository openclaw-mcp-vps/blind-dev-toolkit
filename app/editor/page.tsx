import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccessibleEditor } from "@/components/AccessibleEditor";

export default async function EditorPage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("bdt_access")?.value === "granted";

  if (!hasAccess) {
    redirect("/purchase/success?required=1");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blind Dev Toolkit Workspace</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Screen reader-first editor with semantic navigation, audio diagnostics, and accessibility testing.
          </p>
        </div>
        <Link href="/" className="rounded-md border px-3 py-2 text-sm hover:bg-[#1b2533]">
          Back to Landing
        </Link>
      </div>
      <AccessibleEditor />
    </main>
  );
}
