"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/track";

export function Tracker({ path }: { path: string }) {
  useEffect(() => {
    if (navigator.webdriver && !location.search.includes("track=1")) return; // ignore les robots
    trackView(path);
  }, [path]);
  return null;
}
