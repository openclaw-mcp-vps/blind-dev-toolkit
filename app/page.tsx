import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Ear, ShieldCheck, Users, Workflow } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/access-control";

const faq = [
  {
    question: "How does this reduce navigation overhead for blind developers?",
    answer:
      "The editor ships with spoken line context, symbol-level jump controls, and concise status announcements. Instead of scanning visually dense UI, developers can navigate by keyboard and audio prompts designed around code structure."
  },
  {
    question: "Does it work with NVDA, JAWS, and VoiceOver?",
    answer:
      "Yes. The app uses ARIA live regions, lower-noise announcements, and Monaco accessibility options that improve compatibility with all three major screen readers."
  },
  {
    question: "How does paywall access work after purchase?",
    answer:
      "Checkout happens in Stripe hosted checkout. Stripe webhook events mark your purchase email as active, then dashboard verification sets a secure cookie that unlocks the editor and project APIs."
  },
  {
    question: "Can teams use this for onboarding and pair programming?",
    answer:
      "Yes. Collaboration sync events allow live shared editing, and the dashboard keeps accessible starter projects for team onboarding workflows."
  }
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const access = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(145deg,rgba(17,26,39,0.92),rgba(9,15,24,0.9))] p-8 sm:p-10">
        <Badge className="mb-4">Accessibility Tools · $19/month</Badge>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
          Screen reader optimized coding environment and tools
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--muted)] sm:text-lg">
          Blind Dev Toolkit gives blind and visually impaired engineers an IDE workflow that starts with accessibility instead of patching it in later. Ship faster with audio navigation, concise announcements, and collaboration-ready coding sessions.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className={buttonVariants()} href={access ? "/editor" : "/dashboard"}>
            {access ? "Open Editor" : "Open Dashboard"}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
          <a className={buttonVariants({ variant: "outline" })} href="#pricing">
            View Pricing
          </a>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ear className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
              Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Standard IDEs force visual navigation patterns. Blind developers often spend 3-5x longer locating symbols, understanding state changes, and interpreting diagnostics because tooling is optimized for sighted workflows.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
              Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            This toolkit layers structured speech output, keyboard-first symbol jumps, and accessible debug summaries directly into the editor. Developers get predictable audio feedback for every key coding action.
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Workflow className="h-4 w-4 text-[var(--accent-2)]" aria-hidden="true" />
              Audio Code Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Hear contextual line summaries and symbol outlines on demand. Move through functions and classes without visual scanning.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-[var(--accent-2)]" aria-hidden="true" />
              Collaboration Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Socket-based collaboration broadcasts code updates in real time for pair programming and onboarding sessions.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-2)]" aria-hidden="true" />
              Secure Paywall Access
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted)]">
            Stripe checkout with webhook-backed entitlement verification unlocks access through a secure cookie workflow.
          </CardContent>
        </Card>
      </section>

      <section id="pricing" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-6">
          <h2 className="text-2xl font-semibold">Built for engineers and teams who care about inclusive velocity</h2>
          <p className="text-sm text-[var(--muted)]">
            Companies adopting remote-first hiring are actively expanding talent pipelines. Accessible development tooling helps teams onboard blind engineers effectively and meet accessibility commitments in their products.
          </p>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>Blind and visually impaired software engineers in enterprise and startup teams</li>
            <li>Accessibility consultants building inclusive products for clients</li>
            <li>Engineering organizations improving onboarding for diverse talent</li>
          </ul>
        </div>
        <PricingCard />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-[var(--muted)]">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
