export type ShortcutDef = {
  key: string;
  action: string;
};

export function getEditorShortcuts(): ShortcutDef[] {
  return [
    { key: "Alt+1", action: "Move focus to editor" },
    { key: "Alt+2", action: "Jump to code reader" },
    { key: "Alt+3", action: "Move to keyboard navigator" },
    { key: "Ctrl+Shift+R", action: "Read selected code aloud" },
    { key: "Ctrl+Shift+L", action: "Read current line aloud" },
    { key: "Ctrl+Shift+ArrowDown", action: "Read next line and advance" }
  ];
}

export function splitCodeToLines(value: string): string[] {
  return value.replace(/\r\n/g, "\n").split("\n");
}

export function humanLine(lines: string[], index: number): string {
  const safeIndex = Math.max(0, Math.min(index, lines.length - 1));
  return `Line ${safeIndex + 1}: ${lines[safeIndex] || "blank"}`;
}

export function countComplexitySignals(code: string) {
  const lines = splitCodeToLines(code);
  const longLines = lines.filter((line) => line.length > 90).length;
  const deepNesting = lines.filter((line) => /^\s{8,}/.test(line)).length;
  const totalWords = code.split(/\s+/).filter(Boolean).length;

  return {
    lineCount: lines.length,
    longLines,
    deepNesting,
    estimatedReadTime: Math.max(1, Math.round(totalWords / 180))
  };
}
