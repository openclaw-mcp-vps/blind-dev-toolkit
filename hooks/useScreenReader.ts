"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { detectScreenReader, type ScreenReaderProfile } from "@/lib/accessibility-utils";
import { withPriority } from "@/lib/screen-reader-api";

const defaultProfile: ScreenReaderProfile = {
  engine: "unknown",
  isLikelyEnabled: false,
  platform: "unknown"
};

export function useScreenReader() {
  const [profile, setProfile] = useState<ScreenReaderProfile>(defaultProfile);
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    setProfile(detectScreenReader(navigator.userAgent));
  }, []);

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    setLiveMessage("");

    window.requestAnimationFrame(() => {
      setLiveMessage(withPriority(message, priority));
    });
  }, []);

  const profileSummary = useMemo(() => {
    if (profile.engine === "unknown") {
      return "Screen reader not automatically detected. Manual mode is enabled.";
    }

    return `Detected ${profile.engine.toUpperCase()} profile on ${profile.platform}.`;
  }, [profile.engine, profile.platform]);

  return {
    profile,
    profileSummary,
    liveMessage,
    announce
  };
}
