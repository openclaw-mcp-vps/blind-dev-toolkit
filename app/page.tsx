"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, AudioLines, Keyboard, ListChecks, ShieldCheck } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLemonSqueezyCheckoutUrl } from "@/lib/lemonsqueezy";
import { LemonCheckoutBoot } from "@/components/LemonCheckoutBoot";

export default function LandingPage() {
  const checkoutUrl = useMemo(() => getLemonSqueezyCheckoutUrl(), []);

  const faq = [
    {
      value: "faq-1",
      trigger: "How is this different from a standard browser IDE?",
      content:
        "Blind Dev Toolkit prioritizes spoken structure over visual chrome. Semantic landmarks, concise keyboard flows, and immediate spoken diagnostics are first-class features rather than add-ons."
    },
    {
      value: "faq-2",
      trigger: "What does collaboration include?",
      content:
        "The editor supports real-time cross-tab collaboration and synchronized edits. Teams can co-review accessible code paths without relying on mouse-driven interactions."
    },
    {
      value: "faq-3",
      trigger: "Can I run accessibility checks while coding?",
      content:
        "Yes. Built-in analysis highlights keyboard trap risks, missing ARIA labels, and parser-level issues, then announces them through speech synthesis for quick triage."
    }
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:px-8">
      <LemonCheckoutBoot />
      <header className="rounded-2xl border bg-[#111820]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Accessibility Tools</p>
        <motion.h1
          className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-5xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Screen reader optimized coding environment and tools
        </motion.h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--muted)] md:text-lg">
          Build, review, and debug code with interfaces that are designed for spoken feedback first. Blind Dev Toolkit removes visual friction with semantic navigation, keyboard-first controls, and built-in accessibility intelligence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              className="lemonsqueezy-button inline-flex h-11 items-center rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Start 14-Day Trial - $19/mo
            </a>
          ) : (
            <Button size="lg">Configure Lemon Squeezy IDs to Enable Checkout</Button>
          )}
          <Link href="/editor" className="inline-flex h-11 items-center rounded-md border px-5 text-sm font-semibold hover:bg-[#1b2533]">
            Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mt-14" aria-labelledby="problem-heading">
        <h2 id="problem-heading" className="text-2xl font-semibold">
          The Problem
        </h2>
        <p className="mt-3 max-w-3xl text-[var(--muted)]">
          Most online IDEs are visually dense, keyboard-inconsistent, and force screen reader users to hunt for context. Code structure is often hidden behind panels that were never designed for audio-first navigation.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="solution-heading">
        <h2 id="solution-heading" className="text-2xl font-semibold">
          The Solution
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-5 w-5" /> Semantic Code Navigation
              </CardTitle>
              <CardDescription>
                Jump to functions, classes, and key symbols using structured landmarks that read cleanly in screen readers.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AudioLines className="h-5 w-5" /> Audio Error Feedback
              </CardTitle>
              <CardDescription>
                Hear parser errors and warnings immediately, with line and column details spoken on demand.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5" /> Keyboard-Only Workflows
              </CardTitle>
              <CardDescription>
                High-confidence shortcuts reduce tab-stops and support full coding sessions without mouse interaction.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" /> Integrated Accessibility Tests
              </CardTitle>
              <CardDescription>
                Analyze code for common accessibility regressions while you code, before they hit production.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section id="pricing" className="mt-12" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-2xl font-semibold">
          Pricing
        </h2>
        <Card className="mt-5 max-w-xl">
          <CardHeader>
            <CardTitle>Blind Dev Toolkit Pro</CardTitle>
            <CardDescription>
              For engineers and accessibility teams that need reliable screen-reader-first development workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$19<span className="text-lg font-medium text-[var(--muted)]">/month</span></p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>Semantic navigation and keyboard command palette</li>
              <li>Audio diagnostics and spoken syntax feedback</li>
              <li>Integrated accessibility linting reports</li>
              <li>Real-time collaboration across active sessions</li>
            </ul>
            <div className="mt-5">
              {checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  className="lemonsqueezy-button inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Subscribe and Unlock Editor
                </a>
              ) : (
                <p className="text-sm text-[var(--warning)]">Set Lemon Squeezy env vars to activate checkout.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-semibold">
          FAQ
        </h2>
        <div className="mt-5 max-w-3xl">
          <Accordion items={faq} />
        </div>
      </section>
    </main>
  );
}
