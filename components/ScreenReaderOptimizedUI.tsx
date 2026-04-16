"use client";

import { Keyboard, Ear } from "lucide-react";

type Props = {
  runAnalysis: () => void;
  announceStatus: (message: string) => void;
};

export function ScreenReaderOptimizedUI({ runAnalysis, announceStatus }: Props) {
  return (
    <section aria-label="Keyboard and screen reader controls" className="rounded-xl border bg-[#111820] p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Keyboard className="h-4 w-4" aria-hidden="true" />
        Keyboard-Only Workflow
      </h2>
      <div className="space-y-2 text-xs text-[var(--muted)]">
        <p>
          Press <kbd className="rounded border px-1 py-0.5">Alt+A</kbd> to run accessibility analysis.
        </p>
        <p>
          Press <kbd className="rounded border px-1 py-0.5">Alt+S</kbd> to hear current editor status.
        </p>
        <p>
          Press <kbd className="rounded border px-1 py-0.5">Alt+N</kbd> to focus the semantic navigator.
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={runAnalysis}
          className="rounded-md border bg-[#0d1117] px-3 py-2 text-xs hover:bg-[#182230]"
        >
          Run Analysis Now
        </button>
        <button
          onClick={() => announceStatus("Workspace ready. Keyboard workflow is active.")}
          className="inline-flex items-center gap-1 rounded-md border bg-[#0d1117] px-3 py-2 text-xs hover:bg-[#182230]"
        >
          <Ear className="h-3.5 w-3.5" aria-hidden="true" /> Announce Readiness
        </button>
      </div>
    </section>
  );
}
