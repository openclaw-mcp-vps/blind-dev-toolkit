import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const features = [
  "Unlimited screen reader-tuned editor sessions",
  "Audio landmarks for functions, classes, and regions",
  "Accessible debugging assistant with spoken diagnostics",
  "Keyboard-first workflow presets for NVDA, JAWS, and VoiceOver",
  "Priority support from accessibility specialists"
];

export function PricingTable() {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <Card className="border-sky-500/30 bg-slate-950/70">
      <CardHeader>
        <CardTitle className="text-3xl">Blind Dev Toolkit Pro</CardTitle>
        <CardDescription className="text-base text-slate-300">
          Ship faster with an IDE experience built specifically for non-visual coding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p className="text-4xl font-bold text-sky-300">$19<span className="text-lg text-slate-400">/month</span></p>
          <p className="text-sm text-slate-400">Cancel anytime. Team onboarding docs included.</p>
        </div>

        <ul className="space-y-2 text-sm text-slate-200">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span aria-hidden className="text-sky-300">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {paymentLink ? (
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
            className={buttonVariants({ size: "lg" })}
          >
            Buy Blind Dev Toolkit Pro
          </a>
        ) : (
          <p className="rounded-md border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
            Add `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` to enable checkout.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
