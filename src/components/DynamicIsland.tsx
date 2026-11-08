"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Check, Clock, Download, FileDown, FolderGit2, Home, Info, Mail, PenLine, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navItems, navLabel } from "@/content/profile";
import { track } from "@/lib/track";
import { useIsland } from "./IslandProvider";

const icons = { home: Home, user: User, folder: FolderGit2, clock: Clock, pen: PenLine, download: FileDown, mail: Mail } as const;
const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;
const fade = {
  initial: { opacity: 0, filter: "blur(6px)", scale: 0.96 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: { opacity: 0, filter: "blur(6px)", scale: 0.96 },
  transition: { duration: 0.22 },
};

function ProgressRing() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const dash = useTransform(p, (v) => `${v * 50.3} 50.3`);
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90" aria-hidden>
      <circle cx="11" cy="11" r="8" fill="none" stroke="rgb(255 255 255 / .14)" strokeWidth="2.5" />
      <motion.circle cx="11" cy="11" r="8" fill="none" stroke="#6e92f2" strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray: dash }} />
    </svg>
  );
}

export function DynamicIsland({ photo, cvUrl, name }: { photo: string; cvUrl: string; name: string }) {
  const { notice, clear } = useIsland();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mode = notice ? "notice" : open ? "menu" : "idle";
  const activeLabel = navLabel(pathname);

  const enter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (window.matchMedia("(hover: hover)").matches) setOpen(true);
  };
  const leave = () => {
    // Sur écran tactile, pas de fermeture au « survol » : on ferme avec le bouton ou en naviguant.
    if (!window.matchMedia("(hover: hover)").matches) return;
    hoverTimer.current = setTimeout(() => setOpen(false), 220);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4">
      <motion.nav
        layout
        transition={spring}
        aria-label="Navigation principale"
        onMouseEnter={enter}
        onMouseLeave={leave}
        style={{ borderRadius: 32 }}
        className="glass glass-dark glass-refract pointer-events-auto overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {mode === "idle" && (
            <motion.button
              key="idle"
              {...fade}
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 py-2 pl-2 pr-3"
              aria-expanded={false}
              aria-label="Ouvrir le menu"
            >
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                <Image src={photo} alt="" fill sizes="32px" className="object-cover object-top" />
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                {name}
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
                </span>
              </span>
              <span className="h-4 w-px bg-white/15" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={activeLabel} {...fade} className="min-w-16 text-left font-mono text-xs text-ultra-200">
                  {activeLabel}
                </motion.span>
              </AnimatePresence>
              <ProgressRing />
            </motion.button>
          )}

          {mode === "menu" && (
            <motion.div key="menu" {...fade} className="flex flex-col items-stretch gap-2 p-2 md:flex-row md:items-center">
              <ul className="grid grid-cols-4 gap-1 md:flex">
                {navItems.map((n) => {
                  const Icon = icons[n.icon];
                  const isActive = n.label === activeLabel;
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className={`flex flex-col items-center gap-1 rounded-3xl px-3 py-2 text-[0.72rem] font-medium transition-colors ${
                          isActive ? "bg-white/12 text-white shadow-[inset_0_1px_0_rgb(255_255_255/.25)]" : "text-ultra-200 hover:bg-white/7 hover:text-white"
                        }`}
                      >
                        <Icon size={19} strokeWidth={1.7} />
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-1 md:pl-1">
                {cvUrl && (
                  <a href={cvUrl} target="_blank" rel="noopener" onClick={() => track("cv_download", "island")} className="btn btn-primary flex-1 !px-4 !py-2.5 text-sm">
                    <Download size={16} /> CV
                  </a>
                )}
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full text-ultra-200 hover:bg-white/10 md:hidden" aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {mode === "notice" && notice && (
            <motion.button key={`n-${notice.id}`} {...fade} onClick={() => clear()} className="flex min-w-[260px] items-center gap-3 py-2.5 pl-2.5 pr-5 text-left">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  notice.tone === "error" ? "bg-red-500/90" : notice.tone === "success" ? "bg-ok/90 text-ink-950" : "bg-ultra-500"
                }`}
              >
                {notice.tone === "success" ? <Check size={18} strokeWidth={2.6} /> : notice.tone === "error" ? <X size={18} /> : notice.tone === "typing" ? <TypingDots /> : <Info size={18} />}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{notice.title}</span>
                {notice.subtitle && <span className="text-xs text-ultra-200">{notice.subtitle}</span>}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white"
          animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
