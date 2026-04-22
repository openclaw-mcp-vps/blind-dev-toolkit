import Link from "next/link";
import { PricingTable } from "@/components/PricingTable";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasCheckoutConfigured } from "@/lib/lemonsqueezy";

const problems = [
  "Screen reader users lose context when IDE panes update without accessible announcements.",
  "Visual-only debugging surfaces force blind developers to hunt through logs line-by-line.",
  "Standard code navigation relies on mouse-first interactions instead of deterministic shortcuts."
];

const solutions = [
  "Audio landmarks that jump to functions, classes, and region markers in one command.",
  "Live cursor narration with speech-friendly formatting for symbols and whitespace.",
  "Built-in expression debugger that returns spoken output and accessibility diagnostics.",
  "Focus-trap mode that removes layout noise and keeps screen reader context stable."
];

const faq = [
  {
    question: "Does this replace my existing editor?",
    answer:
      "Blind Dev Toolkit complements your existing stack. You can draft and debug logic here, then move code into your primary repo workflow when needed."
  },
  {
    question: "How does purchase access work?",
    answer:
      "After Stripe checkout, the webhook stores your purchase email. Enter that email in the unlock form and the app sets a signed access cookie for your account."
  },
  {
    question: "Will this work with enterprise onboarding?",
    answer:
      "Yes. Teams can standardize keyboard mappings and onboarding docs around one accessible environment so blind engineers can ramp up quickly."
  },
  {
    question: "Which screen readers are supported?",
    answer:
      "The interaction model is tuned for NVDA, JAWS, and VoiceOver patterns, with predictable ARIA regions and keyboard-first controls."
  }
];

export default function HomePage() {
  const checkoutReady = hasCheckoutConfigured();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-6 py-10 md:px-10 lg:px-12">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">
            Accessibility-Tools · $19/month
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-100 md:text-5xl">
            Screen reader optimized coding environment and tools
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Blind Dev Toolkit removes the visual friction in modern IDEs with spoken code context, keyboard-first navigation, and non-visual debugging built for real engineering work.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/editor" className={buttonVariants({ size: "lg" })}>
              Open Editor Workspace
            </Link>
            <Link href="/dashboard" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Go to Dashboard
            </Link>
          </div>
          {!checkoutReady ? (
            <p className="rounded-md border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
              Configure `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` to activate hosted checkout.
            </p>
          ) : null}
        </div>

        <Card className="border-slate-700/80 bg-slate-950/80">
          <CardHeader>
            <CardTitle>Why teams buy this</CardTitle>
            <CardDescription>Blind engineers spend 3-5x longer in visual-first IDEs. This tool closes that productivity gap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>Reduce onboarding overhead for blind developers.</p>
            <p>Standardize accessible workflows for remote engineering teams.</p>
            <p>Improve retention by giving accessibility-first tooling on day one.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Problem</CardTitle>
            <CardDescription>Visual interfaces make routine coding tasks unnecessarily slow for non-visual developers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-300">
              {problems.map((problem) => (
                <li key={problem} className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                  {problem}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solution</CardTitle>
            <CardDescription>Every core feature is designed to be consumed through speech and keyboard feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-300">
              {solutions.map((solution) => (
                <li key={solution} className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
                  {solution}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <PricingTable />
        <UnlockAccessForm />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-100">FAQ</h2>
        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.question} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <summary className="cursor-pointer text-base font-semibold text-slate-100">{item.question}</summary>
              <p className="mt-2 text-sm text-slate-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 pt-6 text-sm text-slate-400">
        <p>
          Built for blind and visually impaired engineers, accessibility consultants, and inclusive development teams.
        </p>
        <p className="mt-3 text-slate-300">NVDA · JAWS · VoiceOver optimized</p>
      </footer>
    </main>
  );
}
