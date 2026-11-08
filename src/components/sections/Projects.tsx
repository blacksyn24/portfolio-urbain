import { ArrowRight, Code2, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { TrackedLink } from "../TrackedLink";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

// Petit schéma de topologie décoratif propre à chaque projet
export function Topology({ kind }: { kind: Project["topology"] }) {
  const nodes: Record<Project["topology"], [number, number][]> = {
    core: [[50, 22], [22, 58], [78, 58], [22, 88], [78, 88]],
    vlan: [[50, 18], [50, 48], [16, 82], [38, 82], [62, 82], [84, 82]],
    multi: [[18, 50], [50, 22], [50, 78], [82, 50]],
    web: [[20, 50], [50, 50], [80, 30], [80, 70]],
  };
  const links: Record<Project["topology"], [number, number][]> = {
    core: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]],
    vlan: [[0, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
    multi: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 2]],
    web: [[0, 1], [1, 2], [1, 3]],
  };
  const n = nodes[kind] ?? nodes.core;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {(links[kind] ?? links.core).map(([a, b]) => (
        <line key={`${a}-${b}`} x1={n[a][0]} y1={n[a][1]} x2={n[b][0]} y2={n[b][1]} stroke="rgb(175 197 248 / .35)" strokeWidth="0.8" strokeDasharray="2 2" />
      ))}
      {n.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6.5" fill="rgb(46 93 230 / .25)" />
          <circle cx={x} cy={y} r="3.6" fill={i === 0 ? "#e6edfd" : "#6e92f2"} />
        </g>
      ))}
    </svg>
  );
}

export function ProjectCover({ p, className = "h-44" }: { p: Project; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.85rem] bg-gradient-to-br from-ultra-700/50 via-ink-900/60 to-ink-950/80 ${className}`}>
      {p.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 p-6 transition-transform duration-700 group-hover:scale-105">
          <Topology kind={p.topology} />
        </div>
      )}
      <div className="absolute left-3 top-3 flex gap-2">
        <span className="chip glass-dark">{p.category}</span>
        <span className="chip glass-dark font-mono">{p.year}</span>
      </div>
    </div>
  );
}

export function ProjectLinks({ p }: { p: Project }) {
  if (!p.demo_url && !p.repo_url) return null;
  return (
    <div className="relative z-10 flex flex-wrap gap-2">
      {p.demo_url && (
        <TrackedLink event="project_click" label={`${p.slug}:demo`} href={p.demo_url} target="_blank" rel="noopener" className="btn btn-glass !px-4 !py-2 text-sm">
          <ExternalLink size={15} /> Voir
        </TrackedLink>
      )}
      {p.repo_url && (
        <TrackedLink event="project_click" label={`${p.slug}:code`} href={p.repo_url} target="_blank" rel="noopener" className="btn btn-glass !px-4 !py-2 text-sm">
          <Code2 size={15} /> Code
        </TrackedLink>
      )}
    </div>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="glass group relative flex h-full flex-col overflow-hidden rounded-[2.25rem] p-2 transition-transform duration-500 [transition-timing-function:var(--spring)] hover:-translate-y-1">
      <ProjectCover p={p} />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">
          {/* lien étendu : toute la carte est cliquable */}
          <Link href={`/projets/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {p.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ultra-200/80">{p.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span key={t} className="chip font-mono !text-[0.7rem]">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <ProjectLinks p={p} />
          <span className="ml-auto flex items-center gap-1 text-sm text-ultra-300 transition-transform group-hover:translate-x-1">
            Détails <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </article>
  );
}

/** Aperçu des projets mis en avant (page d'accueil). */
export function FeaturedProjects({ projects }: { projects: Project[] }) {
  const list = (projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects).slice(0, 4);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle eyebrow="// projets & labs" title="Ce que j'ai construit" intro="Une sélection de labs réseau documentés." />
        <Link href="/projets" className="btn btn-glass mb-10">
          Tous les projets <ArrowRight size={17} />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {list.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 0.07}>
            <ProjectCard p={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
