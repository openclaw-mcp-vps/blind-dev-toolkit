"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  value: string;
  trigger: string;
  content: string;
}

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.value ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = open === item.value;
        return (
          <div key={item.value} className="rounded-lg border bg-[#111820]">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpen(isOpen ? null : item.value)}
              aria-expanded={isOpen}
              aria-controls={`faq-${item.value}`}
            >
              <span className="font-medium">{item.trigger}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div id={`faq-${item.value}`} className="border-t px-4 py-3 text-sm text-[var(--muted)]">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
