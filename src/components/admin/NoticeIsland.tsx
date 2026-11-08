"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, Loader2, X } from "lucide-react";
import { useIsland } from "../IslandProvider";

/** Dynamic Island du dashboard : n'apparaît que pour les notifications. */
export function NoticeIsland() {
  const { notice, clear } = useIsland();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-3">
      <AnimatePresence>
        {notice && (
          <motion.button
            key={notice.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.6, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, scale: 0.7, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={() => clear()}
            style={{ borderRadius: 32 }}
            className="glass glass-dark glass-refract pointer-events-auto flex min-w-[260px] items-center gap-3 py-2.5 pl-2.5 pr-5 text-left"
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${notice.tone === "error" ? "bg-red-500/90" : notice.tone === "success" ? "bg-ok/90 text-ink-950" : "bg-ultra-500"}`}>
              {notice.tone === "success" ? <Check size={18} strokeWidth={2.6} /> : notice.tone === "error" ? <X size={18} /> : notice.tone === "typing" ? <Loader2 size={17} className="animate-spin" /> : <Info size={18} />}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{notice.title}</span>
              {notice.subtitle && <span className="text-xs text-ultra-200">{notice.subtitle}</span>}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
