"use client";

import { useMemo } from "react";
import { extractCodeLandmarks, type CodeLandmark } from "@/lib/accessibility-utils";
import { formatLandmarkAnnouncement } from "@/lib/screen-reader-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AudioNavigatorProps = {
  code: string;
  currentLine: number;
  onJumpToLine: (line: number) => void;
  onAnnounce: (message: string, priority?: "polite" | "assertive") => void;
};

function getNextLandmark(landmarks: CodeLandmark[], currentLine: number): CodeLandmark | null {
  return landmarks.find((landmark) => landmark.line > currentLine) ?? landmarks[0] ?? null;
}

function getPreviousLandmark(landmarks: CodeLandmark[], currentLine: number): CodeLandmark | null {
  for (let index = landmarks.length - 1; index >= 0; index -= 1) {
    if (landmarks[index].line < currentLine) {
      return landmarks[index];
    }
  }
  return landmarks.at(-1) ?? null;
}

export function AudioNavigator({ code, currentLine, onJumpToLine, onAnnounce }: AudioNavigatorProps) {
  const landmarks = useMemo(() => extractCodeLandmarks(code), [code]);

  const handleLandmarkJump = (landmark: CodeLandmark) => {
    const index = landmarks.findIndex((entry) => entry.line === landmark.line && entry.label === landmark.label);
    onJumpToLine(landmark.line);
    onAnnounce(formatLandmarkAnnouncement(landmark, Math.max(0, index), landmarks.length));
  };

  const handleNext = () => {
    const next = getNextLandmark(landmarks, currentLine);
    if (!next) {
      onAnnounce("No landmarks found in this file yet.", "assertive");
      return;
    }

    handleLandmarkJump(next);
  };

  const handlePrevious = () => {
    const previous = getPreviousLandmark(landmarks, currentLine);
    if (!previous) {
      onAnnounce("No landmarks found in this file yet.", "assertive");
      return;
    }

    handleLandmarkJump(previous);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Audio Navigation Landmarks</CardTitle>
        <CardDescription>
          Jump directly to functions, classes, and named sections without scanning line by line.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrevious}>
            Previous Landmark
          </Button>
          <Button variant="secondary" size="sm" onClick={handleNext}>
            Next Landmark
          </Button>
        </div>

        {landmarks.length === 0 ? (
          <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300">
            No landmarks detected yet. Add function or class declarations to enable rapid jumps.
          </p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-y-auto pr-1 text-sm">
            {landmarks.map((landmark, index) => (
              <li key={`${landmark.kind}-${landmark.label}-${landmark.line}`}>
                <button
                  type="button"
                  onClick={() => handleLandmarkJump(landmark)}
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-left hover:border-sky-500"
                >
                  <span className="block font-semibold text-slate-100">
                    {index + 1}. {landmark.label}
                  </span>
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    {landmark.kind} · line {landmark.line}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
