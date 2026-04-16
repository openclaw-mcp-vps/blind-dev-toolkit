"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PurchaseSuccessClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lemonsqueezy/grant-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId: params.get("checkout_id") ?? "manual-unlock" })
      });

      if (!response.ok) {
        throw new Error("Unable to confirm purchase. Please retry.");
      }

      router.push("/editor");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-bold">Activate Your Workspace</h1>
      <p className="mt-3 text-[var(--muted)]">
        After completing checkout, activate access for this browser. This sets a secure cookie that unlocks the editor paywall.
      </p>
      <Button onClick={handleUnlock} className="mt-6" disabled={loading}>
        {loading ? "Activating Access..." : "I Completed Purchase - Unlock Editor"}
      </Button>
      {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
      <p className="mt-4 text-sm text-[var(--muted)]">
        Need the pricing page? <Link href="/#pricing" className="underline">Go back to plans</Link>
      </p>
    </main>
  );
}
