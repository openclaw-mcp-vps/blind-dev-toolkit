"use client";

import { useEffect } from "react";

export function LemonCheckoutBoot() {
  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const module = await import("@lemonsqueezy/lemonsqueezy.js");
        if (!active) {
          return;
        }
        module.lemonSqueezySetup({});
      } catch {
        // If checkout SDK is blocked, plain checkout links still work.
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
