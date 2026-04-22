import type { CodeLandmark } from "@/lib/accessibility-utils";

export const SR_ONLY_CLASS = "sr-only";

export function formatCursorAnnouncement(
  line: number,
  column: number,
  text: string
): string {
  const safeText = text.trim().length > 0 ? text.trim() : "blank line";
  return `Line ${line}, column ${column}. ${safeText}`;
}

export function formatLandmarkAnnouncement(
  landmark: CodeLandmark,
  index: number,
  total: number
): string {
  return `${landmark.kind} landmark ${index + 1} of ${total}, ${landmark.label}, line ${landmark.line}.`;
}

export function withPriority(message: string, priority: "polite" | "assertive"): string {
  return `${priority === "assertive" ? "Attention" : "Update"}: ${message}`;
}
