import { cookies } from "next/headers";
import { DashboardShell } from "@/components/DashboardShell";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/access-control";

type DashboardPageProps = {
  searchParams: Promise<{
    locked?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const payload = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);

  return (
    <main>
      <DashboardShell
        hasAccess={Boolean(payload)}
        email={payload?.email}
        locked={params.locked === "1"}
      />
    </main>
  );
}
