"use client";

import { useMemo } from "react";
import { humanLine, splitCodeToLines } from "@/lib/accessibility-utils";
import { VoiceSynthesis } from "@/components/VoiceSynthesis";

type CodeReaderProps = {
  code: string;
  activeLine: number;
};

export function CodeReader({ code, activeLine }: CodeReaderProps) {
  const lines = useMemo(() => splitCodeToLines(code), [code]);
  const focusedLine = useMemo(() => humanLine(lines, activeLine), [lines, activeLine]);

  return (
    <section aria-labelledby="code-reader" className="panel p-4">
      <h2 id="code-reader" className="text-lg font-semibold">
        Code Reader
      </h2>
      <p className="mt-2 text-sm text-[#9ba7b4]">The focused line is always available as plain language for faster orientation.</p>
      <div className="mt-4 rounded-md border border-[#30363d] bg-[#0d1117] p-3">
        <p aria-live="polite" className="text-sm leading-relaxed">
          {focusedLine}
        </p>
      </div>
      <div className="mt-3">
        <VoiceSynthesis text={focusedLine} label="Read focused line" />
      </div>
    </section>
  );
}
