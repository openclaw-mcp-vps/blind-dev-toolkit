import Link from "next/link";
import { cookies } from "next/headers";
import { EditorWorkspace } from "@/components/EditorWorkspace";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { PricingTable } from "@/components/PricingTable";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/paywall";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const access = verifyAccessToken(token);

  if (!access) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Editor Access Required</CardTitle>
            <CardDescription>
              The full accessible coding environment is behind the Pro paywall. Complete checkout, then unlock with your purchase email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <Link href="/" className={buttonVariants({ variant: "secondary" })}>
              Back to Landing Page
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
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <EditorWorkspace userEmail={access.email} />
    </main>
  );
}
