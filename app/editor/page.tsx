import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccessibleEditor } from "@/components/AccessibleEditor";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/access-control";

type EditorPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const payload = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);

  if (!payload) {
    redirect("/dashboard?locked=1");
  }

  return (
    <main>
      <AccessibleEditor ownerEmail={payload.email} initialProjectId={params.project} />
    </main>
  );
}
