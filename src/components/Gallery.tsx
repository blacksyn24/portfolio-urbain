"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** Galerie de photos d'un projet, avec visionneuse plein écran (clavier, flèches, balayage). */
export function Gallery({ images, title, heading = "Photos & captures", className = "pt-8" }: { images: string[]; title: string; heading?: string | null; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = images.length;
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  if (!n) return null;

  return (
    <section className={className}>
      {heading !== null && (
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Images size={20} className="text-ultra-300" /> {heading} <span className="font-mono text-sm font-normal text-ultra-200/60">({n})</span>
        </h2>
      )}
      <div className={`grid gap-3 ${n === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className={`glass group relative overflow-hidden rounded-[1.4rem] p-1.5 ${n > 2 && i === 0 ? "col-span-2 row-span-2" : ""}`}
            aria-label={`Agrandir la photo ${i + 1} sur ${n}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} — photo ${i + 1}`} loading="lazy" className="aspect-[4/3] h-full w-full rounded-[1.1rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-ink-950/90 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-label={`Photos — ${title}`}
          >
            <div className="flex items-center justify-between p-4 text-sm text-ultra-200">
              <span className="font-mono">
                {open + 1} / {n}
              </span>
              <button onClick={() => setOpen(null)} className="glass glass-dark grid h-10 w-10 place-items-center rounded-full" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-3 pb-6 sm:px-16" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={images[open]}
                  src={images[open]}
                  alt={`${title} — photo ${open + 1}`}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => (info.offset.x < -60 ? go(1) : info.offset.x > 60 ? go(-1) : null)}
                  className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              </AnimatePresence>
              {n > 1 && (
                <>
                  <button onClick={() => go(-1)} className="glass glass-dark absolute left-2 grid h-11 w-11 place-items-center rounded-full sm:left-4" aria-label="Photo précédente">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => go(1)} className="glass glass-dark absolute right-2 grid h-11 w-11 place-items-center rounded-full sm:right-4" aria-label="Photo suivante">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
