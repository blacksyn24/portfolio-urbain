"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "liked-projects";
const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** Bouton « j'aime » d'un projet : compteur partagé (Supabase), choix mémorisé dans le navigateur. */
export function LikeButton({ slug, initial, className = "" }: { slug: string; initial: number; className?: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => setLiked(read().includes(slug)), [slug]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      const list = read().filter((s) => s !== slug);
      localStorage.setItem(KEY, JSON.stringify(next ? [...list, slug] : list));
    } catch {}
    try {
      const res = await fetch("/api/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, like: next }) });
      if (res.ok) setCount((await res.json()).likes);
    } catch {}
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "Je n'aime plus ce projet" : "J'aime ce projet"}
      title={liked ? "Retirer mon j'aime" : "J'aime"}
      className={`glass glass-dark relative z-20 flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
        <Heart size={17} className={liked ? "fill-[#ff5c8a] text-[#ff5c8a]" : "text-white"} />
      </motion.span>
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  );
}
