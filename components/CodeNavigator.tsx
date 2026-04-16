"use client";

import { ListTree, LocateFixed } from "lucide-react";
import { extractSemanticLandmarks } from "@/lib/code-parser";

type Props = {
  code: string;
  onJumpToLine: (line: number) => void;
};

export function CodeNavigator({ code, onJumpToLine }: Props) {
  const landmarks = extractSemanticLandmarks(code);

  return (
    <section aria-label="Semantic code navigator" className="rounded-xl border bg-[#111820] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ListTree className="h-4 w-4" aria-hidden="true" />
        Semantic Navigator
      </div>
      {landmarks.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No functions, classes, or arrow exports found yet.</p>
      ) : (
        <ul className="space-y-2" role="list">
          {landmarks.map((landmark) => (
            <li key={`${landmark.type}-${landmark.line}`}>
              <button
                className="flex w-full items-center justify-between rounded-md border bg-[#0d1117] px-3 py-2 text-left text-sm hover:bg-[#182230]"
                onClick={() => onJumpToLine(landmark.line)}
              >
                <span className="line-clamp-1 pr-3">{landmark.label}</span>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                  <LocateFixed className="h-3 w-3" aria-hidden="true" />L{landmark.line}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
