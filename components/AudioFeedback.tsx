"use client";

import { Volume2 } from "lucide-react";
import type { ParseIssue } from "@/lib/code-parser";
import { describeIssueForScreenReader, speakAccessibilityMessage } from "@/lib/audio-synthesis";
import { Button } from "@/components/ui/button";

type Props = {
  issues: ParseIssue[];
};

export function AudioFeedback({ issues }: Props) {
  const hasIssues = issues.length > 0;

  const speakSummary = () => {
    if (!hasIssues) {
      speakAccessibilityMessage("No syntax issues detected in the current draft.");
      return;
    }
    const errors = issues.filter((issue) => issue.severity === "error").length;
    const warnings = issues.length - errors;
    speakAccessibilityMessage(`Detected ${errors} errors and ${warnings} warnings.`);
  };

  return (
    <section aria-label="Audio feedback" className="rounded-xl border bg-[#111820] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Volume2 className="h-4 w-4" aria-hidden="true" />
        Audio Feedback
      </div>

      <Button onClick={speakSummary} className="w-full justify-center">
        Announce Current Diagnostics
      </Button>

      <ul className="mt-3 space-y-2" role="list" aria-live="polite">
        {issues.slice(0, 5).map((issue, index) => (
          <li key={`${issue.line}-${issue.column}-${index}`}>
            <button
              onClick={() => speakAccessibilityMessage(describeIssueForScreenReader(issue))}
              className="w-full rounded-md border bg-[#0d1117] px-3 py-2 text-left text-xs hover:bg-[#182230]"
            >
              {issue.severity.toUpperCase()} at L{issue.line}:C{issue.column} - {issue.message}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
