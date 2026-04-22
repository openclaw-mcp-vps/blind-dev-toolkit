"use client";

import { useCallback, useMemo, useState } from "react";
import { AccessibleDebugger } from "@/components/AccessibleDebugger";
import { AccessibleEditor } from "@/components/AccessibleEditor";
import { AudioNavigator } from "@/components/AudioNavigator";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ScreenReaderOptimized } from "@/components/ScreenReaderOptimized";
import { useAudioCues } from "@/hooks/useAudioCues";
import { extractCodeLandmarks, normalizeLineForSpeech, runCodeDiagnostics } from "@/lib/accessibility-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const starterCode = `// region data-loader
export async function fetchIssues(owner: string, repo: string) {
  const endpoint = "https://api.github.com/repos/" + owner + "/" + repo + "/issues";
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Unable to load issues for " + owner + "/" + repo);
  }
  return response.json();
}

export function summarizeIssueTitles(titles: string[]) {
  return titles
    .filter((title) => title.trim().length > 0)
    .map((title) => title.trim())
    .join(" | ");
}
`;

type EditorWorkspaceProps = {
  userEmail: string;
};

export function EditorWorkspace({ userEmail }: EditorWorkspaceProps) {
  const [code, setCode] = useState(starterCode);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);
  const [currentLineText, setCurrentLineText] = useState("// region data-loader");
  const [jumpToLine, setJumpToLine] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("Workspace ready.");
  const [focusMode, setFocusMode] = useState(false);

  const { enabled: audioEnabled, toggle: toggleAudio, speak, tone } = useAudioCues(true);
  const landmarks = useMemo(() => extractCodeLandmarks(code), [code]);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      setStatusMessage(message);
      speak(message, priority);
      if (priority === "assertive") {
        void tone("error");
      } else {
        void tone("navigation");
      }
    },
    [speak, tone]
  );

  const jumpRelative = useCallback(
    (direction: "next" | "prev") => {
      if (landmarks.length === 0) {
        announce("No landmarks are available in this file yet.", "assertive");
        return;
      }

      if (direction === "next") {
        const next = landmarks.find((landmark) => landmark.line > currentLine) ?? landmarks[0];
        setJumpToLine(next.line);
        announce(`Jumped to ${next.label} on line ${next.line}.`);
        return;
      }

      const previous = [...landmarks].reverse().find((landmark) => landmark.line < currentLine) ?? landmarks.at(-1)!;
      setJumpToLine(previous.line);
      announce(`Jumped to ${previous.label} on line ${previous.line}.`);
    },
    [announce, currentLine, landmarks]
  );

  const readCurrentLine = useCallback(() => {
    announce(`Line ${currentLine}, column ${currentColumn}. ${normalizeLineForSpeech(currentLineText)}`);
  }, [announce, currentColumn, currentLine, currentLineText]);

  const runDiagnostics = useCallback(() => {
    const diagnostics = runCodeDiagnostics(code);
    announce(`${diagnostics.summary} ${diagnostics.checks.join(" ")}`, diagnostics.score < 75 ? "assertive" : "polite");
  }, [announce, code]);

  const toggleAudioAndReport = useCallback(() => {
    const nextStateMessage = audioEnabled ? "Audio cues disabled." : "Audio cues enabled.";
    toggleAudio();
    setStatusMessage(nextStateMessage);
  }, [audioEnabled, toggleAudio]);

  return (
    <ScreenReaderOptimized
      title="Blind Dev Toolkit Editor"
      description="A keyboard-first, spoken-feedback code environment that integrates with NVDA, JAWS, and VoiceOver workflows."
      statusMessage={statusMessage}
      focusMode={focusMode}
      onToggleFocusMode={() => setFocusMode((state) => !state)}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signed in as {userEmail}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-300 md:grid-cols-3">
          <p>Current line: {currentLine}</p>
          <p>Current column: {currentColumn}</p>
          <p>Audio cues: {audioEnabled ? "On" : "Off"}</p>
        </CardContent>
      </Card>

      <KeyboardShortcuts
        onReadCurrentLine={readCurrentLine}
        onJumpNextLandmark={() => jumpRelative("next")}
        onJumpPreviousLandmark={() => jumpRelative("prev")}
        onRunDiagnostics={runDiagnostics}
        onToggleAudio={toggleAudioAndReport}
        onToggleFocusMode={() => setFocusMode((state) => !state)}
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <AccessibleEditor
          code={code}
          jumpToLine={jumpToLine}
          onCodeChange={setCode}
          onCursorChange={(line, column, lineText) => {
            setCurrentLine(line);
            setCurrentColumn(column);
            setCurrentLineText(lineText);
          }}
          onAnnounce={announce}
        />
        <AudioNavigator
          code={code}
          currentLine={currentLine}
          onJumpToLine={(line) => setJumpToLine(line)}
          onAnnounce={announce}
        />
      </div>

      <AccessibleDebugger code={code} onAnnounce={announce} />
    </ScreenReaderOptimized>
  );
}
