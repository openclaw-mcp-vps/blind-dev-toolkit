"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Shortcut = {
  key: string;
  action: string;
};

type ScreenReaderOptimizerProps = {
  politeMessage: string;
  assertiveMessage: string;
  screenReaderLikely: boolean;
  shortcuts: Shortcut[];
};

export function ScreenReaderOptimizer({
  politeMessage,
  assertiveMessage,
  screenReaderLikely,
  shortcuts
}: ScreenReaderOptimizerProps) {
  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>

      <Card>
        <CardHeader className="flex items-start justify-between gap-3 sm:flex-row">
          <div className="space-y-2">
            <CardTitle>Screen Reader Optimization</CardTitle>
            <p className="text-sm text-[var(--muted)]">
              Editor announcements are tuned for structured, low-noise output that works with NVDA,
              JAWS, and VoiceOver.
            </p>
          </div>
          <Badge>{screenReaderLikely ? "Screen Reader Signal Detected" : "Manual Mode"}</Badge>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.key} className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <span className="font-semibold text-[var(--foreground)]">{shortcut.key}</span> {shortcut.action}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
