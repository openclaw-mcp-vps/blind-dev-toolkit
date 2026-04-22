export type CueTone = "navigation" | "success" | "error";

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  priority?: "polite" | "assertive";
};

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  return new AudioContextConstructor();
}

export function speakText(text: string, options: SpeakOptions = {}): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.priority === "assertive" ? 1 : 0.92;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export async function playTone(kind: CueTone): Promise<void> {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const toneConfig: Record<CueTone, { frequency: number; duration: number }> = {
    navigation: { frequency: 640, duration: 0.08 },
    success: { frequency: 880, duration: 0.14 },
    error: { frequency: 220, duration: 0.24 }
  };

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = toneConfig[kind].frequency;
  gainNode.gain.value = 0.07;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + toneConfig[kind].duration);

  await new Promise<void>((resolve) => {
    oscillator.onended = () => resolve();
  });

  await context.close();
}
