"use client";

import { ReactNode, useEffect } from "react";
import FocusTrap from "focus-trap-react";
import { useScreenReader } from "@/hooks/useScreenReader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ScreenReaderOptimizedProps = {
  title: string;
  description: string;
  statusMessage: string;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  children: ReactNode;
};

export function ScreenReaderOptimized({
  title,
  description,
  statusMessage,
  focusMode,
  onToggleFocusMode,
  children
}: ScreenReaderOptimizedProps) {
  const { liveMessage, announce, profileSummary } = useScreenReader();

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    announce(statusMessage, "polite");
  }, [announce, statusMessage]);

  return (
    <section aria-label={title} className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
            <p className="text-sm text-slate-300">{description}</p>
            <p className="text-xs text-slate-400">{profileSummary}</p>
          </div>
          <Button variant="secondary" onClick={onToggleFocusMode}>
            {focusMode ? "Disable Focus Trap" : "Enable Focus Trap"}
          </Button>
        </div>
      </Card>

      <FocusTrap active={focusMode}>
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4">{children}</div>
      </FocusTrap>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>
      <p className="sr-only" aria-live="assertive" aria-atomic="true">
        {statusMessage}
      </p>
    </section>
  );
}
