"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackView } from "@/lib/track";

export function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (navigator.webdriver && !location.search.includes("track=1")) return; // ignore les robots
    trackView(path);
  }, [path]);
  return null;
}
