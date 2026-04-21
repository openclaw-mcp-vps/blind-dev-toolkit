"use client";

import Editor from "@monaco-editor/react";
import { Activity, Save, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { io, type Socket } from "socket.io-client";
import { AudioNavigator } from "@/components/AudioNavigator";
import { ScreenReaderOptimizer } from "@/components/ScreenReaderOptimizer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAudioNavigation } from "@/hooks/useAudioNavigation";
import { useScreenReader } from "@/hooks/useScreenReader";
import { buildLineAnnouncement } from "@/lib/screen-reader-bridge";

type AccessibleEditorProps = {
  ownerEmail: string;
  initialProjectId?: string;
};

type ProjectPayload = {
  id: string;
  name: string;
  content: string;
  language: string;
  updatedAt: string;
};

type CollaborationMessage = {
  projectId: string;
  content: string;
  updatedAt: string;
};

const starterSnippet = `type BuildIssue = {
  id: string;
  severity: "critical" | "warning" | "info";
  details: string;
};

export function summarizeBuildIssues(issues: BuildIssue[]) {
  const critical = issues.filter((issue) => issue.severity === "critical");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  if (critical.length > 0) {
    return "Stop release: " + critical.length + " critical issue(s) need immediate fixes.";
  }

  if (warnings.length > 0) {
    return "Proceed with caution: " + warnings.length + " warnings remain.";
  }

  return "All checks passed. Accessible release is ready.";
}
`;

function generateProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}`;
}

export function AccessibleEditor({ ownerEmail, initialProjectId }: AccessibleEditorProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(() =>
    initialProjectId && initialProjectId !== "new" ? initialProjectId : generateProjectId()
  );
  const [projectName, setProjectName] = useState("Accessibility Collaboration Workspace");
  const [code, setCode] = useState(starterSnippet);
  const [saveStatus, setSaveStatus] = useState("Unsaved changes");
  const [cursorLine, setCursorLine] = useState(1);
  const [collabStatus, setCollabStatus] = useState<"connecting" | "connected" | "offline">("connecting");
  const [isSaving, setIsSaving] = useState(false);

  const editorRef = useRef<
    Parameters<NonNullable<ComponentProps<typeof Editor>["onMount"]>>[0] | null
  >(null);
  const codeRef = useRef(code);
  const socketRef = useRef<Socket | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { announce, politeMessage, assertiveMessage, screenReaderLikely, shortcuts } = useScreenReader();
  const { audioEnabled, outline, announceLine, announceOutline, toggleAudio } = useAudioNavigation(code);

  const diagnostics = useMemo(() => {
    const lines = code.split("\n");
    const todos = lines.filter((line) => line.includes("TODO")).length;
    const longLines = lines.filter((line) => line.length > 100).length;
    return { todos, longLines, totalLines: lines.length };
  }, [code]);

  const collaborationBadge = collabStatus === "connected" ? "Live Collaboration" : "Local Mode";

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    if (!initialProjectId || initialProjectId === "new") {
      return;
    }

    let mounted = true;

    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects?id=${encodeURIComponent(initialProjectId)}`);
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { project?: ProjectPayload | null };
        if (!mounted || !payload.project) {
          return;
        }

        setProjectId(payload.project.id);
        setProjectName(payload.project.name);
        setCode(payload.project.content);
        setSaveStatus(`Loaded project updated ${new Date(payload.project.updatedAt).toLocaleString()}`);
        announce("Project loaded successfully.");
      } catch {
        announce("Unable to load selected project.", "assertive");
      }
    };

    void loadProject();

    return () => {
      mounted = false;
    };
  }, [announce, initialProjectId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_COLLAB_SERVER_URL || window.location.origin;
    const socket = io(endpoint, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setCollabStatus("connected");
      socket.emit("project:join", projectId);
      announce("Collaboration connection established.");
    });

    socket.on("disconnect", () => {
      setCollabStatus("offline");
    });

    socket.on("connect_error", () => {
      setCollabStatus("offline");
    });

    socket.on("project:update", (payload: CollaborationMessage) => {
      if (payload.projectId !== projectId || payload.content === codeRef.current) {
        return;
      }

      setCode(payload.content);
      setSaveStatus(`Remote update received at ${new Date(payload.updatedAt).toLocaleTimeString()}`);
      announce("Incoming collaboration update applied.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [announce, projectId]);

  const saveProject = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("Saving project...");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: projectId,
          name: projectName,
          content: code,
          language: "typescript"
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        project?: ProjectPayload;
      };

      if (response.status === 401) {
        router.push("/dashboard?locked=1");
        return;
      }

      if (!response.ok || !payload.project) {
        setSaveStatus(payload.error ?? "Save failed");
        announce(payload.error ?? "Save failed.", "assertive");
        return;
      }

      setProjectId(payload.project.id);
      setProjectName(payload.project.name);
      setSaveStatus(`Saved at ${new Date(payload.project.updatedAt).toLocaleTimeString()}`);
      announce("Project saved.");
    } catch {
      setSaveStatus("Network error while saving");
      announce("Network error while saving.", "assertive");
    } finally {
      setIsSaving(false);
    }
  }, [announce, code, projectId, projectName, router]);

  const handleEditorChange = (value: string | undefined) => {
    const nextCode = value ?? "";
    setCode(nextCode);
    setSaveStatus("Unsaved changes");

    const socket = socketRef.current;
    if (!socket?.connected) {
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(() => {
      socket.emit("project:update", {
        projectId,
        content: nextCode,
        updatedAt: new Date().toISOString()
      });
    }, 220);
  };

  const jumpToLine = useCallback(
    (line: number) => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }

      editor.setPosition({ lineNumber: line, column: 1 });
      editor.revealLineInCenter(line);
      editor.focus();
      setCursorLine(line);
      void announceLine(line);
      announce(`Moved cursor to line ${line}.`);
    },
    [announce, announceLine]
  );

  const readCurrentLine = useCallback(async () => {
    const line = editorRef.current?.getPosition()?.lineNumber ?? cursorLine;
    await announceLine(line);
    announce(buildLineAnnouncement(codeRef.current, line));
  }, [announce, announceLine, cursorLine]);

  useEffect(() => {
    const onGlobalShortcut = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        void saveProject();
      }

      if (key === "1") {
        event.preventDefault();
        void readCurrentLine();
      }

      if (key === "2") {
        event.preventDefault();
        void announceOutline();
      }

      if (key === "n") {
        event.preventDefault();
        void toggleAudio();
      }
    };

    window.addEventListener("keydown", onGlobalShortcut);
    return () => {
      window.removeEventListener("keydown", onGlobalShortcut);
    };
  }, [announceOutline, readCurrentLine, saveProject, toggleAudio]);

  return (
    <section className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/85 p-4">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Accessible Editor Workspace</h1>
          <p className="text-sm text-[var(--muted)]">
            Signed in as {ownerEmail}. Optimize coding flow with spoken line summaries and keyboard-first navigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{collaborationBadge}</Badge>
          <Badge>{audioEnabled ? "Audio On" : "Audio Off"}</Badge>
        </div>
      </header>

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium" htmlFor="projectName">
                Project Name
              </label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="max-w-md"
              />
              <Button onClick={() => void saveProject()} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving" : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => void toggleAudio()}>
                {audioEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                Toggle Audio
              </Button>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[#0a1019] p-2">
              <Editor
                height="62vh"
                theme="vs-dark"
                defaultLanguage="typescript"
                language="typescript"
                value={code}
                onChange={handleEditorChange}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  editor.updateOptions({
                    accessibilitySupport: "on",
                    ariaLabel: "Blind Dev Toolkit accessible code editor",
                    minimap: { enabled: false },
                    stickyScroll: { enabled: false },
                    lineNumbersMinChars: 3,
                    smoothScrolling: true,
                    wordWrap: "on",
                    tabSize: 2,
                    fontSize: 16,
                    lineHeight: 24
                  });

                  editor.onDidChangeCursorPosition((event) => {
                    setCursorLine(event.position.lineNumber);
                  });

                  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.Digit1, () => {
                    void readCurrentLine();
                  });

                  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.Digit2, () => {
                    void announceOutline();
                  });

                  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyN, () => {
                    void toggleAudio();
                  });

                  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyS, () => {
                    void saveProject();
                  });

                  announce("Editor loaded. Use Alt plus 1 for line readout and Alt plus 2 for symbol outline.");
                }}
                options={{
                  automaticLayout: true,
                  quickSuggestions: false,
                  parameterHints: { enabled: true },
                  suggestOnTriggerCharacters: true,
                  contextmenu: false
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1 text-[var(--foreground)]">
                <Activity className="h-4 w-4" aria-hidden="true" />
                {saveStatus}
              </span>
              <span>Line {cursorLine}</span>
              <span>{diagnostics.totalLines} total lines</span>
              <span>{diagnostics.longLines} long lines (&gt;100 chars)</span>
              <span>{diagnostics.todos} TODO markers</span>
              <span className="flex items-center gap-1">
                {collabStatus === "connected" ? (
                  <Wifi className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                ) : (
                  <WifiOff className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
                )}
                {collabStatus}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <AudioNavigator
              symbols={outline}
              onJumpToLine={jumpToLine}
              onReadOutline={() => void announceOutline()}
              audioEnabled={audioEnabled}
            />

            <ScreenReaderOptimizer
              politeMessage={politeMessage}
              assertiveMessage={assertiveMessage}
              screenReaderLikely={screenReaderLikely}
              shortcuts={shortcuts}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
