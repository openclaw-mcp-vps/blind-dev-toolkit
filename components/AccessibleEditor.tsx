"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { BellRing, Bug, Users } from "lucide-react";
import { CodeNavigator } from "@/components/CodeNavigator";
import { AudioFeedback } from "@/components/AudioFeedback";
import { ScreenReaderOptimizedUI } from "@/components/ScreenReaderOptimizedUI";
import { runAccessibilityAnalysis } from "@/lib/accessibility-engine";
import { speakAccessibilityMessage } from "@/lib/audio-synthesis";

const STARTER_CODE = `export function SaveButton() {
  return (
    <button aria-label="Save current file" onClick={() => console.log("saved")}>Save</button>
  );
}`;

const COLLAB_CHANNEL = "blind-dev-toolkit-editor";

export function AccessibleEditor() {
  const [code, setCode] = useState(STARTER_CODE);
  const [collabPeers, setCollabPeers] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navSectionRef = useRef<HTMLElement | null>(null);
  const report = useMemo(() => runAccessibilityAnalysis(code), [code]);

  useEffect(() => {
    const channel = new BroadcastChannel(COLLAB_CHANNEL);
    channel.postMessage({ type: "presence", at: Date.now() });

    const peerHeartbeats = new Map<string, number>();
    const id = `${Date.now()}-${Math.random()}`;

    const heartbeat = setInterval(() => {
      channel.postMessage({ type: "heartbeat", id, at: Date.now() });
      const now = Date.now();
      const active = Array.from(peerHeartbeats.values()).filter((ts) => now - ts < 4000).length;
      setCollabPeers(Math.max(1, active + 1));
    }, 1500);

    channel.onmessage = (event: MessageEvent) => {
      const message = event.data as { type: string; code?: string; id?: string; at?: number };

      if (message.type === "code-sync" && typeof message.code === "string") {
        setCode(message.code);
      }
      if (message.type === "heartbeat" && message.id && message.at) {
        peerHeartbeats.set(message.id, message.at);
      }
    };

    return () => {
      clearInterval(heartbeat);
      channel.close();
    };
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel(COLLAB_CHANNEL);
    channel.postMessage({ type: "code-sync", code });
    return () => channel.close();
  }, [code]);

  const runAnalysis = () => {
    const critical = report.hints.filter((hint) => hint.severity === "critical").length;
    speakAccessibilityMessage(
      `Analysis complete. Score ${report.score} out of 100. ${report.parseIssues.length} parser issues and ${critical} critical accessibility warnings.`
    );
  };

  const announceEditorStatus = (message?: string) => {
    speakAccessibilityMessage(message ?? `Current code length ${code.length} characters. Score ${report.score}.`);
  };

  const jumpToLine = (line: number) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const lines = textarea.value.split("\n");
    const offset = lines.slice(0, line - 1).join("\n").length + (line > 1 ? 1 : 0);
    textarea.focus();
    textarea.setSelectionRange(offset, offset);
    speakAccessibilityMessage(`Cursor moved to line ${line}`);
  };

  useHotkeys("alt+a", (event) => {
    event.preventDefault();
    runAnalysis();
  });

  useHotkeys("alt+s", (event) => {
    event.preventDefault();
    announceEditorStatus();
  });

  useHotkeys("alt+n", (event) => {
    event.preventDefault();
    navSectionRef.current?.querySelector("button")?.focus();
    speakAccessibilityMessage("Semantic navigator focused.");
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-xl border bg-[#111820] p-4" aria-label="Accessible editor">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            Live collaboration peers: {collabPeers}
          </span>
          <span className="inline-flex items-center gap-1">
            <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
            Alt+A analyze | Alt+S status | Alt+N navigator
          </span>
        </div>
        <label htmlFor="code-editor" className="mb-2 block text-sm font-semibold">
          Code Buffer
        </label>
        <textarea
          ref={textareaRef}
          id="code-editor"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="h-[420px] w-full resize-y rounded-md border bg-[#0d1117] p-3 font-mono text-sm leading-6"
          aria-describedby="editor-help"
        />
        <p id="editor-help" className="mt-2 text-xs text-[var(--muted)]">
          This editor favors predictable screen reader output over visual-only syntax highlighting. Diagnostics and landmarks are mirrored in plain text regions.
        </p>
      </section>

      <div className="space-y-4">
        <section ref={navSectionRef}>
          <CodeNavigator code={code} onJumpToLine={jumpToLine} />
        </section>

        <AudioFeedback issues={report.parseIssues} />

        <ScreenReaderOptimizedUI runAnalysis={runAnalysis} announceStatus={announceEditorStatus} />

        <section aria-label="Accessibility test report" className="rounded-xl border bg-[#111820] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Bug className="h-4 w-4" aria-hidden="true" />
            Accessibility Report
          </h2>
          <p className="mb-3 text-sm">
            Score: <strong>{report.score}/100</strong>
          </p>
          <ul role="list" className="space-y-2 text-xs">
            {report.hints.map((hint) => (
              <li key={hint.id} className="rounded-md border bg-[#0d1117] p-2">
                <strong>{hint.title}</strong>
                <p className="mt-1 text-[var(--muted)]">{hint.detail}</p>
              </li>
            ))}
            {report.hints.length === 0 && (
              <li className="rounded-md border bg-[#0d1117] p-2 text-[var(--success)]">
                No accessibility warnings detected in this pass.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
