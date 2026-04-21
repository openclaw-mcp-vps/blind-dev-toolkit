"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const includedFeatures = [
  "Screen reader-first Monaco editor profile for NVDA, JAWS, and VoiceOver",
  "Audio navigation with keyboard-first symbol jumps and spoken line context",
  "Accessible debugging panel with concise issue announcements",
  "Collaboration-ready project sync model for paired coding sessions",
  "Onboarding templates for teams hiring blind developers"
];

export function PricingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Card className="border-[#2b3f5c] bg-[linear-gradient(160deg,rgba(17,26,39,0.95),rgba(12,20,31,0.92))]">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-2)]">Team Plan</p>
          <CardTitle className="text-3xl">$19/month</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            One price for daily usage: optimized editor workflows, collaboration support, and access to accessibility-focused tooling updates.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-[var(--muted)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3">
          <a
            className={buttonVariants({ className: "w-full sm:w-auto" })}
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noreferrer"
            aria-label="Buy Blind Dev Toolkit with Stripe hosted checkout"
          >
            Buy with Stripe Checkout
          </a>
          <p className="text-xs text-[var(--muted)]">
            After checkout, return to your dashboard and unlock access using the same purchase email.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
