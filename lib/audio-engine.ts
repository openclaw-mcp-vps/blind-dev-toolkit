export type CueType = "move" | "success" | "warning";

type SpeechOptions = {
  rate?: number;
  pitch?: number;
};

const cueToNote: Record<CueType, string> = {
  move: "C5",
  success: "G5",
  warning: "A3"
};

export function speechSynthesisAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(text: string, options: SpeechOptions = {}) {
  if (!speechSynthesisAvailable() || !text.trim()) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

let toneReady = false;

async function ensureToneReady() {
  if (typeof window === "undefined") {
    return null;
  }

  const tone = await import("tone");
  if (!toneReady) {
    await tone.start();
    toneReady = true;
  }
  return tone;
}

export async function playCue(cue: CueType) {
  const tone = await ensureToneReady();
  if (!tone) {
    return;
  }

  const synth = new tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.02,
      release: 0.08
    }
  }).toDestination();

  synth.triggerAttackRelease(cueToNote[cue], "16n");

  setTimeout(() => {
    synth.dispose();
  }, 250);
}
