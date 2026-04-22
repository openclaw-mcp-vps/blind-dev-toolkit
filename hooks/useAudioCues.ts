"use client";

import { useCallback, useState } from "react";
import { playTone, speakText } from "@/lib/audio-feedback";

export function useAudioCues(initialEnabled = true) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const speak = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (!enabled) {
        return;
      }

      speakText(message, { priority });
    },
    [enabled]
  );

  const tone = useCallback(
    async (kind: "navigation" | "success" | "error") => {
      if (!enabled) {
        return;
      }

      await playTone(kind);
    },
    [enabled]
  );

  const toggle = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  return {
    enabled,
    setEnabled,
    toggle,
    speak,
    tone
  };
}
