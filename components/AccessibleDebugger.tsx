"use client";

import { FormEvent, useMemo, useState } from "react";
import { runCodeDiagnostics } from "@/lib/accessibility-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AccessibleDebuggerProps = {
  code: string;
  onAnnounce: (message: string, priority?: "polite" | "assertive") => void;
};

function evaluateExpression(expression: string, code: string): string {
  const lines = code.split("\n");
  const helpers = {
    lineCount: lines.length,
    line: (lineNumber: number) => lines[lineNumber - 1] ?? "",
    contains: (value: string) => code.includes(value),
    count: (value: string) => {
      if (!value) return 0;
      return code.split(value).length - 1;
    }
  };

  const evaluator = new Function(
    "helpers",
    "\"use strict\"; const { lineCount, line, contains, count } = helpers; return (" + expression + ");"
  );

  const result = evaluator(helpers);
  if (typeof result === "string") {
    return result;
  }

  return JSON.stringify(result, null, 2);
}

export function AccessibleDebugger({ code, onAnnounce }: AccessibleDebuggerProps) {
  const [expression, setExpression] = useState("count(\"TODO\")");
  const [output, setOutput] = useState("No expression executed yet.");

  const diagnostics = useMemo(() => runCodeDiagnostics(code), [code]);

  const runExpression = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = evaluateExpression(expression, code);
      const message = `Expression result: ${result}`;
      setOutput(message);
      onAnnounce(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown debugger execution error.";
      setOutput(`Error: ${message}`);
      onAnnounce(`Debugger error. ${message}`, "assertive");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Accessible Debugger</CardTitle>
        <CardDescription>
          Run expression checks with spoken results instead of relying on visual debugger panels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={runExpression} className="space-y-3">
          <label className="block space-y-1 text-sm text-slate-200">
            <span>Debugger expression</span>
            <input
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-sky-400"
              placeholder="lineCount"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              Run Expression
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setExpression("lineCount")}>
              Insert `lineCount`
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setExpression("contains(\"await\")")}>
              Insert `contains("await")`
            </Button>
          </div>
        </form>

        <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
          <p className="text-sm text-slate-300" role="status" aria-live="polite">
            {output}
          </p>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
          <p className="text-sm font-semibold text-sky-300">{diagnostics.summary}</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            {diagnostics.checks.map((check) => (
              <li key={check}>• {check}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
