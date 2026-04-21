"use client";

import { useCallback, useMemo, useState } from "react";
import { summarizeEditorShortcuts } from "@/lib/screen-reader-bridge";

type Priority = "polite" | "assertive";

export function useScreenReader() {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const screenReaderLikely = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const signal = `${navigator.userAgent} ${navigator.platform}`;
    return /(voiceover|nvda|jaws|orca)/i.test(signal);
  }, []);

  const announce = useCallback((message: string, priority: Priority = "polite") => {
    const normalized = message.trim();
    if (!normalized) {
      return;
    }

    if (priority === "assertive") {
      setAssertiveMessage("");
      requestAnimationFrame(() => setAssertiveMessage(normalized));
      return;
    }

    setPoliteMessage("");
    requestAnimationFrame(() => setPoliteMessage(normalized));
  }, []);

  return {
    announce,
    politeMessage,
    assertiveMessage,
    screenReaderLikely,
    shortcuts: summarizeEditorShortcuts()
  };
}
