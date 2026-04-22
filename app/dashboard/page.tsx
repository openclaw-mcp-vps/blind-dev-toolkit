import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/LogoutButton";
import { PricingTable } from "@/components/PricingTable";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = verifyAccessToken(token);

  if (!access) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Locked</CardTitle>
            <CardDescription>
              This workspace is available after purchase. Use the checkout link and unlock form to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <Link href="/" className={buttonVariants({ variant: "secondary" })}>
              Return to Landing Page
            </Link>
          </CardContent>
        </Card>
        <section className="grid gap-6 lg:grid-cols-2">
          <PricingTable />
          <UnlockAccessForm />
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Accessible Dev Dashboard</h1>
          <p className="text-slate-300">Signed in as {access.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/editor" className={buttonVariants()}>
            Open Editor
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navigation Mode</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Landmark jumps and cursor announcements are active. Press <code>Alt+2</code> in the editor to move between functions.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debugger Mode</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Use expression checks to validate code structure without relying on a visual breakpoint panel.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Screen Reader Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Recommended profile: speech verbosity high, punctuation some, line numbers enabled.
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Team Onboarding Checklist</CardTitle>
          <CardDescription>Use this sequence to onboard blind engineers in under an hour.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-6 text-sm text-slate-300">
            <li>Confirm NVDA, JAWS, or VoiceOver settings with project defaults.</li>
            <li>Run the keyboard shortcut walkthrough in the editor.</li>
            <li>Create landmarks (`// region`, `function`, `class`) in shared code templates.</li>
            <li>Use debugger expressions to verify API response assumptions quickly.</li>
            <li>Document agreed shortcut conventions for your team repo.</li>
          </ol>
        </CardContent>
      </Card>
    </main>
  );
}
