"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { getLineText, normalizeLineForSpeech } from "@/lib/accessibility-utils";
import { formatCursorAnnouncement } from "@/lib/screen-reader-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AccessibleEditorProps = {
  code: string;
  jumpToLine: number | null;
  onCodeChange: (nextCode: string) => void;
  onCursorChange: (line: number, column: number, lineText: string) => void;
  onAnnounce: (message: string, priority?: "polite" | "assertive") => void;
};

export function AccessibleEditor({
  code,
  jumpToLine,
  onCodeChange,
  onCursorChange,
  onAnnounce
}: AccessibleEditorProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const hasAnnouncedInitialHelpRef = useRef(false);

  const currentLineText = useMemo(() => {
    return getLineText(code, editorRef.current?.getPosition()?.lineNumber ?? 1);
  }, [code]);

  const announceCurrentLine = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const position = editor.getPosition();
    if (!position) {
      return;
    }

    const lineText = getLineText(code, position.lineNumber);
    onAnnounce(formatCursorAnnouncement(position.lineNumber, position.column, normalizeLineForSpeech(lineText)));
  }, [code, onAnnounce]);

  const announceSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const selection = editor.getSelection();
    if (!selection) {
      onAnnounce("No selection available.", "assertive");
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    const selected = model.getValueInRange(selection).trim();
    if (!selected) {
      onAnnounce("Selection is empty.", "assertive");
      return;
    }

    const text = normalizeLineForSpeech(selected.length > 220 ? `${selected.slice(0, 220)}...` : selected);
    onAnnounce(`Selected code: ${text}`);
  }, [onAnnounce]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((event) => {
      const lineText = getLineText(code, event.position.lineNumber);
      onCursorChange(event.position.lineNumber, event.position.column, lineText);
    });

    if (!hasAnnouncedInitialHelpRef.current) {
      onAnnounce("Editor loaded. Use Alt+2 for next landmark and Alt+1 to read current line.");
      hasAnnouncedInitialHelpRef.current = true;
    }
  };

  useEffect(() => {
    if (!editorRef.current || !jumpToLine) {
      return;
    }

    editorRef.current.setPosition({ lineNumber: jumpToLine, column: 1 });
    editorRef.current.revealLineInCenter(jumpToLine);
    editorRef.current.focus();
  }, [jumpToLine]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Screen Reader Optimized Editor</CardTitle>
        <CardDescription>
          Monaco configured for line-level speech feedback, keyboard-first control, and precise cursor narration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={announceCurrentLine}>
            Read Current Line
          </Button>
          <Button variant="secondary" size="sm" onClick={announceSelection}>
            Read Selection
          </Button>
          <p className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300">
            Cursor context: {normalizeLineForSpeech(currentLineText)}
          </p>
        </div>

        <Editor
          height="480px"
          language="typescript"
          theme="vs-dark"
          value={code}
          onMount={handleEditorMount}
          onChange={(value) => onCodeChange(value ?? "")}
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            wordWrap: "on",
            glyphMargin: true,
            scrollBeyondLastLine: false,
            fontSize: 15,
            accessibilitySupport: "on",
            ariaLabel: "Blind Dev Toolkit accessible code editor"
          }}
        />
      </CardContent>
    </Card>
  );
}
