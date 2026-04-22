"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type KeyboardShortcutsProps = {
  onReadCurrentLine: () => void;
  onJumpNextLandmark: () => void;
  onJumpPreviousLandmark: () => void;
  onRunDiagnostics: () => void;
  onToggleAudio: () => void;
  onToggleFocusMode: () => void;
};

const shortcutMap = [
  { keys: "Alt + 1", action: "Read current line" },
  { keys: "Alt + 2", action: "Jump to next landmark" },
  { keys: "Alt + Shift + 2", action: "Jump to previous landmark" },
  { keys: "Alt + 3", action: "Run diagnostics" },
  { keys: "Alt + A", action: "Toggle audio cues" },
  { keys: "Alt + M", action: "Toggle focus mode" }
];

export function KeyboardShortcuts({
  onReadCurrentLine,
  onJumpNextLandmark,
  onJumpPreviousLandmark,
  onRunDiagnostics,
  onToggleAudio,
  onToggleFocusMode
}: KeyboardShortcutsProps) {
  useHotkeys("alt+1", onReadCurrentLine, { enableOnFormTags: true, preventDefault: true });
  useHotkeys("alt+2", onJumpNextLandmark, { enableOnFormTags: true, preventDefault: true });
  useHotkeys("alt+shift+2", onJumpPreviousLandmark, { enableOnFormTags: true, preventDefault: true });
  useHotkeys("alt+3", onRunDiagnostics, { enableOnFormTags: true, preventDefault: true });
  useHotkeys("alt+a", onToggleAudio, { enableOnFormTags: true, preventDefault: true });
  useHotkeys("alt+m", onToggleFocusMode, { enableOnFormTags: true, preventDefault: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
        <CardDescription>Every workflow in this toolkit is operable without a mouse.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {shortcutMap.map((shortcut) => (
            <li key={shortcut.keys} className="flex items-center justify-between rounded-md border border-slate-800 px-3 py-2">
              <span className="font-mono text-sky-300">{shortcut.keys}</span>
              <span className="text-slate-300">{shortcut.action}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
