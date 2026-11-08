"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type IslandNotice = {
  id: number;
  title: string;
  subtitle?: string;
  tone?: "success" | "error" | "info" | "typing";
  duration?: number; // ms ; 0 = reste affiché jusqu'à clear()
};

type Ctx = {
  notice: IslandNotice | null;
  notify: (n: Omit<IslandNotice, "id">) => number;
  clear: (id?: number) => void;
};

const IslandContext = createContext<Ctx | null>(null);

export function IslandProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<IslandNotice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const clear = useCallback((id?: number) => {
    setNotice((cur) => (id === undefined || cur?.id === id ? null : cur));
  }, []);

  const notify = useCallback((n: Omit<IslandNotice, "id">) => {
    const id = ++counter.current;
    if (timer.current) clearTimeout(timer.current);
    setNotice({ ...n, id });
    const d = n.duration ?? 3800;
    if (d > 0) timer.current = setTimeout(() => clear(id), d);
    return id;
  }, [clear]);

  // Reflet spéculaire des surfaces en verre + détection de la réfraction (Chromium)
  useEffect(() => {
    const ua = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData;
    if (ua?.brands?.some((b) => /Chromium/i.test(b.brand))) {
      document.documentElement.classList.add("can-refract");
    }
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".glass") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <IslandContext.Provider value={{ notice, notify, clear }}>{children}</IslandContext.Provider>;
}

export function useIsland() {
  const ctx = useContext(IslandContext);
  if (!ctx) throw new Error("useIsland doit être utilisé dans <IslandProvider>");
  return ctx;
}
