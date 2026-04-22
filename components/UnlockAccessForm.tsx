"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ApiResponse = {
  authenticated: boolean;
  message?: string;
};

export function UnlockAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Checking your purchase record...");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.authenticated) {
        setStatus(
          data.message ??
            "No completed purchase was found for that email yet. If you just checked out, wait a minute for webhook processing and retry."
        );
        return;
      }

      setStatus("Access unlocked. Redirecting to your dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setStatus("Unable to verify purchase right now. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Already Purchased?</CardTitle>
        <CardDescription>
          Enter the same email used at Stripe checkout to activate your cookie-based access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3" aria-label="Unlock purchased access">
          <label className="block space-y-1 text-sm text-slate-200">
            <span>Purchase email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-400"
              placeholder="you@company.com"
            />
          </label>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Verifying..." : "Unlock My Workspace"}
          </Button>
          {status ? (
            <p role="status" className="rounded-md bg-slate-900 p-2 text-sm text-slate-300">
              {status}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
