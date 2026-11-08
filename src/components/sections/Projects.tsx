import { Code2, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { TrackedLink } from "../TrackedLink";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

// Petit schéma de topologie décoratif propre à chaque projet
function Topology({ kind }: { kind: Project["topology"] }) {
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
  const n = nodes[kind];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      {links[kind].map(([a, b]) => (
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

export function Projects({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  return (
    <section id="projets" className="mx-auto max-w-6xl px-4 pt-28">
      <SectionTitle eyebrow="// projets & labs" title="Ce que j'ai construit" intro="Labs réseau documentés et projets réalisés en formation ou en stage." />
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 0.07}>
            <article className="glass group flex h-full flex-col overflow-hidden rounded-[2.25rem] p-2 transition-transform duration-500 [transition-timing-function:var(--spring)] hover:-translate-y-1">
              <div className="relative h-44 overflow-hidden rounded-[1.85rem] bg-gradient-to-br from-ultra-700/50 via-ink-900/60 to-ink-950/80">
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
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ultra-200/80">{p.summary}</p>
                {(p.demo_url || p.repo_url) && (
                  <div className="mt-4 flex gap-2">
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
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="chip font-mono !text-[0.7rem]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
