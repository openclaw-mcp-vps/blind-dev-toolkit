"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Headphones, Keyboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    q: "How does Blind Dev Toolkit improve screen reader coding speed?",
    a: "The editor keeps line focus, spoken output, and keyboard navigation in sync. You always hear exactly where you are, without hunting through visual UI state."
  },
  {
    q: "Does this replace my existing editor stack?",
    a: "No. It complements your workflow for high-focus coding and review sessions, then you can move changes back into your standard repository process."
  },
  {
    q: "How does access work after payment?",
    a: "When Lemon Squeezy confirms your purchase, you verify with your order ID and email once. We set a secure browser cookie that unlocks the protected toolkit pages."
  }
];

export default function HomePage() {
  const checkoutUrl = useMemo(() => {
    const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
    if (!productId) return null;
    const query = new URLSearchParams({
      embed: "1",
      media: "0",
      logo: "0",
      checkout: "true"
    });
    return `https://app.lemonsqueezy.com/checkout/buy/${productId}?${query.toString()}`;
  }, []);
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startCheckout = () => {
    if (!checkoutUrl) {
      setStatus("Checkout is not configured yet. Add Lemon Squeezy environment variables.");
      return;
    }

    const popup = window.open(checkoutUrl, "_blank", "noopener,noreferrer,width=980,height=760");
    if (!popup) setStatus("Please allow popups to open the secure checkout window.");
  };

  const unlockAccess = async () => {
    setStatus(null);
    setLoading(true);

    try {
      const response = await fetch("/api/paywall/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderId })
      });

      const payload = (await response.json()) as { status?: string; error?: string };
      if (!response.ok) {
        setStatus(payload.error ?? "Unable to verify purchase.");
        return;
      }

      setStatus("Purchase verified. Access unlocked. Opening your dashboard...");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch {
      setStatus("Network error while verifying purchase. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="container pb-24 pt-16">
        <div className="panel relative overflow-hidden p-8 md:p-12">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(31,111,235,0.22),_transparent_72%)] md:block" />
          <div className="relative max-w-3xl">
            <p className="inline-flex rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7ee787]">
              Accessibility Tools · $19/month
            </p>
            <h1 className="section-title mt-5 text-4xl leading-tight md:text-5xl">
              Screen reader optimized coding environment and tools
            </h1>
            <p className="mt-5 text-lg text-[#c2cbd6]">
              Blind Dev Toolkit is a focused workspace for blind and low-vision developers who want faster code navigation, accurate spoken review, and fewer accessibility blockers in daily development.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={startCheckout}>
                Start secure checkout
              </Button>
              <Link href="/editor" className="inline-flex h-11 items-center rounded-md border border-[#30363d] px-5 text-sm font-semibold hover:bg-[#21262d]">
                Preview the editor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="panel p-5">
            <Headphones className="h-5 w-5 text-[#7ee787]" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Problem</h2>
            <p className="mt-2 text-sm text-[#9ba7b4]">
              Most coding tools expose critical context visually, making blind developers work around noisy interfaces and fragmented announcements.
            </p>
          </article>
          <article className="panel p-5">
            <Keyboard className="h-5 w-5 text-[#79c0ff]" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Solution</h2>
            <p className="mt-2 text-sm text-[#9ba7b4]">
              A keyboard-first editor with predictable focus, line-aware narration, and spoken summaries for rapid code review.
            </p>
          </article>
          <article className="panel p-5">
            <ShieldCheck className="h-5 w-5 text-[#d2a8ff]" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Outcome</h2>
            <p className="mt-2 text-sm text-[#9ba7b4]">
              Developers maintain flow, reduce context switching, and deliver accessibility-aware code faster across teams.
            </p>
          </article>
        </div>
      </section>

      <section className="container pb-20">
        <div className="panel p-8 md:p-10">
          <h2 className="section-title text-3xl">Pricing</h2>
          <p className="mt-2 text-[#9ba7b4]">One plan with full access to the coding workspace and all accessibility tools.</p>
          <div className="mt-6 rounded-xl border border-[#30363d] bg-[#0d1117] p-6">
            <p className="text-sm uppercase tracking-wider text-[#9ba7b4]">Blind Dev Toolkit Pro</p>
            <p className="mt-2 text-4xl font-bold">$19<span className="text-lg font-medium text-[#9ba7b4]"> / month</span></p>
            <ul className="mt-5 space-y-2 text-sm text-[#c2cbd6]">
              {["Accessible editor with speech-linked cursor tracking", "Code Reader for line-by-line spoken context", "Keyboard map with zero-mouse workflow", "Protected dashboard and member tool access"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#7ee787]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button onClick={startCheckout}>Subscribe now</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="panel p-8 md:p-10">
          <h2 className="section-title text-3xl">Unlock Your Toolkit</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#9ba7b4]">
            After checkout, paste the same email used for payment and your Lemon Squeezy order ID. We verify the purchase and unlock this browser.
          </p>
          <form
            className="mt-6 grid gap-3 md:max-w-xl"
            onSubmit={(event) => {
              event.preventDefault();
              void unlockAccess();
            }}
          >
            <label className="grid gap-1 text-sm">
              Purchase email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2"
                placeholder="name@company.com"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Order ID
              <input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                required
                className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2"
                placeholder="123456"
              />
            </label>
            <div>
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying purchase..." : "Verify and unlock"}
              </Button>
            </div>
            {status ? <p aria-live="polite" className="text-sm text-[#9ba7b4]">{status}</p> : null}
          </form>
        </div>
      </section>

      <section className="container pb-24">
        <div className="panel p-8 md:p-10">
          <h2 className="section-title text-3xl">FAQ</h2>
          <div className="mt-5 space-y-4">
            {faqItems.map((item) => (
              <article key={item.q} className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-[#9ba7b4]">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
