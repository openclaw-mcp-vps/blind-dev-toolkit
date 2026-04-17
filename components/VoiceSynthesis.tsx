"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type VoiceSynthesisProps = {
  text: string;
  label?: string;
};

export function VoiceSynthesis({ text, label = "Narrate" }: VoiceSynthesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canSpeak = useMemo(() => typeof window !== "undefined" && "speechSynthesis" in window, []);

  const speak = useCallback(() => {
    if (!canSpeak || !text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [canSpeak, text]);

  const stop = useCallback(() => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [canSpeak]);

  if (!canSpeak) {
    return <p className="text-sm text-[#9ba7b4]">Speech synthesis is not available in this browser.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={speak} disabled={!text.trim()}>
        {label}
      </Button>
      <Button onClick={stop} variant="subtle" disabled={!isSpeaking}>
        Stop narration
      </Button>
    </div>
  );
}
