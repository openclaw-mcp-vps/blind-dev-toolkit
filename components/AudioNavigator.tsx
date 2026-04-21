"use client";

import { useMemo, useState } from "react";
import { Headphones, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CodeSymbol } from "@/lib/screen-reader-bridge";

type AudioNavigatorProps = {
  symbols: CodeSymbol[];
  onJumpToLine: (line: number) => void;
  onReadOutline: () => void;
  audioEnabled: boolean;
};

export function AudioNavigator({
  symbols,
  onJumpToLine,
  onReadOutline,
  audioEnabled
}: AudioNavigatorProps) {
  const [filter, setFilter] = useState("");

  const filteredSymbols = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) {
      return symbols;
    }

    return symbols.filter(
      (symbol) =>
        symbol.name.toLowerCase().includes(normalized) ||
        symbol.kind.toLowerCase().includes(normalized)
    );
  }, [filter, symbols]);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">Audio Navigator</CardTitle>
          <Button variant="secondary" size="sm" onClick={onReadOutline}>
            <Headphones className="mr-2 h-4 w-4" aria-hidden="true" />
            Speak Outline
          </Button>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Jump through functions and classes without hunting visually. Audio status: {audioEnabled ? "On" : "Off"}.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="sr-only" htmlFor="symbol-filter">
          Filter symbols
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            id="symbol-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="pl-10"
            placeholder="Filter symbols by name or type"
          />
        </div>

        <ul className="max-h-80 space-y-2 overflow-auto">
          {filteredSymbols.length === 0 ? (
            <li className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">
              No matching symbols found.
            </li>
          ) : (
            filteredSymbols.map((symbol) => (
              <li key={`${symbol.kind}-${symbol.name}-${symbol.line}`}>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start whitespace-normal py-2 text-left"
                  onClick={() => onJumpToLine(symbol.line)}
                >
                  <span className="font-semibold text-[var(--foreground)]">{symbol.name}</span>
                  <span className="ml-2 text-xs uppercase tracking-wide text-[var(--muted)]">
                    {symbol.kind} · line {symbol.line}
                  </span>
                </Button>
              </li>
            ))
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
