import type { ParseIssue } from "@/lib/code-parser";

export function speakAccessibilityMessage(message: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function describeIssueForScreenReader(issue: ParseIssue) {
  return `${issue.severity} at line ${issue.line}, column ${issue.column}. ${issue.message}`;
}
