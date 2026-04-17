"use client";

import { useCallback, useMemo, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useHotkeys } from "react-hotkeys-hook";
import { create } from "zustand";
import type { editor as MonacoEditor } from "monaco-editor";
import { CodeReader } from "@/components/CodeReader";
import { KeyboardNavigator } from "@/components/KeyboardNavigator";
import { VoiceSynthesis } from "@/components/VoiceSynthesis";
import { countComplexitySignals, humanLine, splitCodeToLines } from "@/lib/accessibility-utils";

type EditorState = {
  code: string;
  activeLine: number;
  setCode: (code: string) => void;
  setActiveLine: (line: number) => void;
};

const initialCode = `function announceStatus(taskName, completed) {
  const status = completed ? "done" : "in progress";
  return "Task " + taskName + " is " + status + ".";
}

export function summarizeBuild(steps) {
  return steps
    .map((step, index) => "Step " + (index + 1) + ": " + step)
    .join("\\n");
}`;

const useEditorStore = create<EditorState>((set) => ({
  code: initialCode,
  activeLine: 0,
  setCode: (code) => set({ code }),
  setActiveLine: (line) => set({ activeLine: line })
}));

export function AccessibleEditor() {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const code = useEditorStore((state) => state.code);
  const activeLine = useEditorStore((state) => state.activeLine);
  const setCode = useEditorStore((state) => state.setCode);
  const setActiveLine = useEditorStore((state) => state.setActiveLine);

  const lines = useMemo(() => splitCodeToLines(code), [code]);
  const focusedLineText = useMemo(() => humanLine(lines, activeLine), [lines, activeLine]);
  const stats = useMemo(() => countComplexitySignals(code), [code]);

  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  useHotkeys("ctrl+shift+l", () => {
    speakText(focusedLineText);
  });

  useHotkeys("ctrl+shift+r", () => {
    const selection = editorRef.current?.getModel()?.getValueInRange(editorRef.current.getSelection()!);
    speakText(selection?.trim() ? `Selected code. ${selection}` : focusedLineText);
  });

  useHotkeys("ctrl+shift+down", () => {
    const nextLine = Math.min(lines.length - 1, activeLine + 1);
    setActiveLine(nextLine);
    editorRef.current?.revealLineInCenter(nextLine + 1);
    editorRef.current?.setPosition({ lineNumber: nextLine + 1, column: 1 });
    speakText(humanLine(lines, nextLine));
  });

  useHotkeys("alt+1", () => editorRef.current?.focus());

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section aria-labelledby="editor-title" className="panel p-4">
        <h2 id="editor-title" className="text-lg font-semibold">
          Accessible Code Editor
        </h2>
        <p className="mt-2 text-sm text-[#9ba7b4]">
          The editor keeps line focus synchronized with speech output and exposes predictable keyboard commands.
        </p>

        <div className="mt-4 overflow-hidden rounded-md border border-[#30363d]">
          <Editor
            height="420px"
            defaultLanguage="typescript"
            value={code}
            theme="vs-dark"
            onMount={(editor) => {
              editorRef.current = editor;
              editor.onDidChangeCursorPosition((event) => {
                setActiveLine(event.position.lineNumber - 1);
              });
            }}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              lineHeight: 24,
              smoothScrolling: true,
              cursorWidth: 3,
              tabSize: 2,
              ariaLabel: "Blind Dev Toolkit code editor",
              accessibilitySupport: "on"
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#30363d] bg-[#0d1117] p-3 text-sm">
          <p>
            <span className="text-[#9ba7b4]">Complexity snapshot:</span> {stats.lineCount} lines, {stats.longLines} long lines, {stats.deepNesting} deeply nested lines.
          </p>
          <p>
            <span className="text-[#9ba7b4]">Estimated review time:</span> {stats.estimatedReadTime} min
          </p>
        </div>

        <div className="mt-3">
          <VoiceSynthesis text={code} label="Read full code" />
        </div>
      </section>

      <div className="space-y-4">
        <CodeReader code={code} activeLine={activeLine} />
        <KeyboardNavigator />
      </div>
    </div>
  );
}
