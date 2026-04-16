import { ParseIssue, parseCodeForIssues } from "@/lib/code-parser";

export type AccessibilityHint = {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "important" | "info";
};

export type AccessibilityReport = {
  parseIssues: ParseIssue[];
  hints: AccessibilityHint[];
  score: number;
};

export function runAccessibilityAnalysis(code: string): AccessibilityReport {
  const parseIssues = parseCodeForIssues(code);
  const hints: AccessibilityHint[] = [];
  const lines = code.split("\n");

  if (!code.includes("aria-label") && !code.includes("aria-labelledby")) {
    hints.push({
      id: "aria-labels",
      title: "Add explicit ARIA labels",
      detail: "Interactive controls should include aria-label or aria-labelledby for reliable screen reader announcements.",
      severity: "important"
    });
  }

  if (!/button|a\s+href|input|textarea|select/.test(code)) {
    hints.push({
      id: "interactive-surface",
      title: "No obvious interactive controls found",
      detail: "If this UI is user-driven, ensure keyboard-focusable elements are present and reachable.",
      severity: "info"
    });
  }

  if (lines.some((line) => line.includes("onClick") && !line.includes("onKeyDown"))) {
    hints.push({
      id: "keyboard-fallback",
      title: "Keyboard fallback is missing on click handlers",
      detail: "Elements with onClick should expose keyboard handlers or be native controls.",
      severity: "critical"
    });
  }

  const critical = hints.filter((h) => h.severity === "critical").length;
  const important = hints.filter((h) => h.severity === "important").length;
  const parserErrors = parseIssues.filter((issue) => issue.severity === "error").length;

  const score = Math.max(0, 100 - critical * 25 - important * 12 - parserErrors * 8);

  return { parseIssues, hints, score };
}
