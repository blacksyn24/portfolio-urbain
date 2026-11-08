"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./sections/Projects";

/** Grille de projets avec filtres par catégorie et par technologie. */
export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ["Tous", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    projects.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 10);
  }, [projects]);
  const [cat, setCat] = useState("Tous");
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  const list = projects.filter(
    (p) => (cat === "Tous" || p.category === cat) && (!tag || p.tags.includes(tag)) && (!needle || `${p.title} ${p.summary} ${p.tags.join(" ")}`.toLowerCase().includes(needle))
  );

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un lab : VLAN, PPP, AfriBank…" className="field !w-auto min-w-0 flex-1 !rounded-full" aria-label="Rechercher un projet" />
        <span className="font-mono text-sm text-ultra-200/70">{list.length} projet{list.length > 1 ? "s" : ""}</span>
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="glass flex rounded-full p-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${cat === c ? "bg-white/15 text-white" : "text-ultra-200/75 hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(tag === t ? null : t)} className={`chip font-mono !text-[0.72rem] transition-colors ${tag === t ? "!bg-ultra-500 !text-white" : "hover:bg-white/12"}`}>
            {t}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">Aucun projet ne correspond à ce filtre.</p>
      ) : (
        <motion.div layout className="grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
                <ProjectCard p={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
