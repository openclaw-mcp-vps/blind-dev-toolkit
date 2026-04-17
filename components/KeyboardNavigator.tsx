"use client";

import { getEditorShortcuts } from "@/lib/accessibility-utils";

export function KeyboardNavigator() {
  const shortcuts = getEditorShortcuts();

  return (
    <section aria-labelledby="keyboard-map" className="panel p-4">
      <h2 id="keyboard-map" className="text-lg font-semibold">
        Keyboard Navigation Map
      </h2>
      <p className="mt-2 text-sm text-[#9ba7b4]">
        Every core feature is reachable from the keyboard. The tool announces region changes through your screen reader and keeps a predictable tab order.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {shortcuts.map((shortcut) => (
          <li key={shortcut.key} className="flex items-center justify-between rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2">
            <span className="font-mono text-[#7ee787]">{shortcut.key}</span>
            <span>{shortcut.action}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
