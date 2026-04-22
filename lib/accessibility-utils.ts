export type ScreenReaderEngine = "nvda" | "jaws" | "voiceover" | "unknown";

export type ScreenReaderProfile = {
  engine: ScreenReaderEngine;
  isLikelyEnabled: boolean;
  platform: "windows" | "mac" | "linux" | "unknown";
};

export type CodeLandmarkKind = "function" | "class" | "interface" | "constant" | "region";

export type CodeLandmark = {
  line: number;
  label: string;
  kind: CodeLandmarkKind;
};

export type CodeDiagnostics = {
  score: number;
  summary: string;
  checks: string[];
};

export function detectScreenReader(userAgent: string): ScreenReaderProfile {
  const normalized = userAgent.toLowerCase();

  const platform: ScreenReaderProfile["platform"] = normalized.includes("windows")
    ? "windows"
    : normalized.includes("macintosh") || normalized.includes("mac os")
      ? "mac"
      : normalized.includes("linux")
        ? "linux"
        : "unknown";

  let engine: ScreenReaderEngine = "unknown";
  if (normalized.includes("nvda")) {
    engine = "nvda";
  } else if (normalized.includes("jaws")) {
    engine = "jaws";
  } else if (normalized.includes("voiceover")) {
    engine = "voiceover";
  } else if (platform === "mac") {
    engine = "voiceover";
  }

  return {
    engine,
    platform,
    isLikelyEnabled: engine !== "unknown"
  };
}

export function normalizeLineForSpeech(line: string): string {
  if (!line.trim()) {
    return "blank line";
  }

  return line
    .replace(/\t/g, " tab ")
    .replace(/[{}]/g, (match) => (match === "{" ? " open brace " : " close brace "))
    .replace(/[()[\]]/g, (match) => {
      if (match === "(") return " open parenthesis ";
      if (match === ")") return " close parenthesis ";
      if (match === "[") return " open bracket ";
      return " close bracket ";
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function getLineText(code: string, lineNumber: number): string {
  const lines = code.split("\n");
  return lines[Math.max(0, lineNumber - 1)] ?? "";
}

export function extractCodeLandmarks(code: string): CodeLandmark[] {
  const lines = code.split("\n");
  const landmarks: CodeLandmark[] = [];

  const patterns: Array<{ regex: RegExp; kind: CodeLandmarkKind }> = [
    { regex: /^\s*export\s+function\s+(\w+)/, kind: "function" },
    { regex: /^\s*function\s+(\w+)/, kind: "function" },
    { regex: /^\s*(?:const|let)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/, kind: "function" },
    { regex: /^\s*class\s+(\w+)/, kind: "class" },
    { regex: /^\s*interface\s+(\w+)/, kind: "interface" },
    { regex: /^\s*const\s+(\w+)\s*=\s*/, kind: "constant" },
    { regex: /^\s*\/\/\s*region\s+(.+)/i, kind: "region" }
  ];

  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        landmarks.push({
          line: index + 1,
          label: match[1],
          kind: pattern.kind
        });
        break;
      }
    }
  });

  return landmarks;
}

export function runCodeDiagnostics(code: string): CodeDiagnostics {
  const lines = code.split("\n");
  const checks: string[] = [];
  let score = 100;

  const longLines = lines.filter((line) => line.length > 110).length;
  if (longLines > 0) {
    score -= Math.min(20, longLines * 2);
    checks.push(`${longLines} lines exceed 110 characters; consider line wrapping for better speech chunking.`);
  }

  const tabLines = lines.filter((line) => line.includes("\t")).length;
  if (tabLines > 0) {
    score -= Math.min(10, tabLines);
    checks.push(`${tabLines} lines use tab indentation; spaces are more predictable for screen reader repetition.`);
  }

  const unmatchedBraces = Math.abs((code.match(/{/g) ?? []).length - (code.match(/}/g) ?? []).length);
  if (unmatchedBraces > 0) {
    score -= 25;
    checks.push("Brace count is unbalanced, which usually indicates a syntax issue.");
  }

  if (checks.length === 0) {
    checks.push("No major accessibility-oriented code structure warnings were found.");
  }

  return {
    score: Math.max(0, score),
    summary: `Accessibility code score ${Math.max(0, score)} out of 100.`,
    checks
  };
}
