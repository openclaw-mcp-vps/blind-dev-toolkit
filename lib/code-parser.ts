export type ParseIssue = {
  line: number;
  column: number;
  severity: "error" | "warning";
  message: string;
};

const OPENING = ["(", "[", "{"];
const CLOSING = [")", "]", "}"];

export function parseCodeForIssues(code: string): ParseIssue[] {
  const issues: ParseIssue[] = [];
  const stack: Array<{ char: string; line: number; column: number }> = [];
  const lines = code.split("\n");

  lines.forEach((lineText, lineIndex) => {
    for (let i = 0; i < lineText.length; i += 1) {
      const ch = lineText[i];
      if (OPENING.includes(ch)) {
        stack.push({ char: ch, line: lineIndex + 1, column: i + 1 });
      }
      if (CLOSING.includes(ch)) {
        const expectedOpen = OPENING[CLOSING.indexOf(ch)];
        const top = stack.pop();
        if (!top || top.char !== expectedOpen) {
          issues.push({
            line: lineIndex + 1,
            column: i + 1,
            severity: "error",
            message: `Unexpected '${ch}'.`
          });
        }
      }
    }

    if (/\b(var)\b/.test(lineText)) {
      issues.push({
        line: lineIndex + 1,
        column: lineText.indexOf("var") + 1,
        severity: "warning",
        message: "Avoid 'var'; prefer 'const' or 'let' for clearer scope."
      });
    }
  });

  stack.forEach((item) => {
    issues.push({
      line: item.line,
      column: item.column,
      severity: "error",
      message: `Unclosed '${item.char}'.`
    });
  });

  return issues;
}

export function extractSemanticLandmarks(code: string) {
  const lines = code.split("\n");
  return lines
    .map((line, index) => {
      const trimmed = line.trim();
      if (/^(export\s+)?(async\s+)?function\s+\w+/.test(trimmed)) {
        return { line: index + 1, type: "function", label: trimmed };
      }
      if (/^(const|let)\s+\w+\s*=\s*\(?.*=>/.test(trimmed)) {
        return { line: index + 1, type: "arrow", label: trimmed };
      }
      if (/^class\s+\w+/.test(trimmed)) {
        return { line: index + 1, type: "class", label: trimmed };
      }
      return null;
    })
    .filter((x): x is { line: number; type: string; label: string } => x !== null);
}
