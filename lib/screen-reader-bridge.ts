export type CodeSymbol = {
  line: number;
  kind: "function" | "class" | "interface" | "constant" | "type";
  name: string;
};

const symbolMatchers: Array<{ kind: CodeSymbol["kind"]; matcher: RegExp }> = [
  { kind: "function", matcher: /^\s*(?:export\s+)?function\s+([\w$]+)/ },
  { kind: "class", matcher: /^\s*(?:export\s+)?class\s+([\w$]+)/ },
  { kind: "interface", matcher: /^\s*(?:export\s+)?interface\s+([\w$]+)/ },
  {
    kind: "constant",
    matcher: /^\s*(?:export\s+)?const\s+([\w$]+)\s*=\s*(?:\(|async\s*\(|[^=]+=>)/
  },
  { kind: "type", matcher: /^\s*(?:export\s+)?type\s+([\w$]+)/ }
];

export function extractCodeOutline(code: string): CodeSymbol[] {
  const lines = code.split("\n");
  const outline: CodeSymbol[] = [];

  lines.forEach((line, index) => {
    for (const { kind, matcher } of symbolMatchers) {
      const match = line.match(matcher);
      if (match?.[1]) {
        outline.push({
          line: index + 1,
          kind,
          name: match[1]
        });
        return;
      }
    }
  });

  return outline;
}

export function buildLineAnnouncement(code: string, lineNumber: number) {
  const lines = code.split("\n");
  const currentLine = lines[lineNumber - 1] ?? "";
  const trimmed = currentLine.trim();

  if (!trimmed) {
    return `Line ${lineNumber}, blank line.`;
  }

  const indentation = currentLine.match(/^\s*/)?.[0].length ?? 0;
  const words = trimmed.split(/\s+/).length;
  return `Line ${lineNumber}, indentation ${indentation} spaces, ${words} words. ${trimmed}`;
}

export function summarizeEditorShortcuts() {
  return [
    { key: "Alt + 1", action: "Read the current line" },
    { key: "Alt + 2", action: "Read symbol outline" },
    { key: "Alt + S", action: "Save project" },
    { key: "Alt + N", action: "Toggle audio navigation" }
  ];
}
