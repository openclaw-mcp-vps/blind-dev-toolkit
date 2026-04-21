"use client";

import { useCallback, useMemo, useState } from "react";
import { playCue, speakText, speechSynthesisAvailable } from "@/lib/audio-engine";
import { buildLineAnnouncement, extractCodeOutline } from "@/lib/screen-reader-bridge";

export function useAudioNavigation(code: string) {
  const [audioEnabled, setAudioEnabled] = useState(true);

  const outline = useMemo(() => extractCodeOutline(code), [code]);

  const announceLine = useCallback(
    async (lineNumber: number) => {
      if (!audioEnabled) {
        return;
      }
      const summary = buildLineAnnouncement(code, lineNumber);
      speakText(summary, { rate: 1.02, pitch: 1 });
      await playCue("move");
    },
    [audioEnabled, code]
  );

  const announceOutline = useCallback(async () => {
    if (!audioEnabled) {
      return;
    }

    if (outline.length === 0) {
      speakText("No symbols detected in this file yet.");
      await playCue("warning");
      return;
    }

    const spokenOutline = outline
      .slice(0, 12)
      .map((symbol) => `${symbol.kind} ${symbol.name} line ${symbol.line}`)
      .join(". ");

    speakText(`Detected ${outline.length} symbols. ${spokenOutline}`);
    await playCue("success");
  }, [audioEnabled, outline]);

  const toggleAudio = useCallback(async () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (next) {
      speakText("Audio navigation enabled.");
      await playCue("success");
    }
  }, [audioEnabled]);

  return {
    audioEnabled,
    speechReady: speechSynthesisAvailable(),
    outline,
    announceLine,
    announceOutline,
    toggleAudio
  };
}
