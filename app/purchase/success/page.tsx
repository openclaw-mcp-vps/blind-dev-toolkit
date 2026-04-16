import { Suspense } from "react";
import { PurchaseSuccessClient } from "@/components/PurchaseSuccessClient";

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16">
          <p className="text-sm text-[var(--muted)]">Loading checkout confirmation...</p>
        </main>
      }
    >
      <PurchaseSuccessClient />
    </Suspense>
  );
}
