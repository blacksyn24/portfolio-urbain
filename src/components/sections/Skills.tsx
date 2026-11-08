import { Code2, FlaskConical, Network, Route, ShieldCheck, TerminalSquare } from "lucide-react";
import type { SkillGroup } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

const icons = { route: Route, network: Network, shield: ShieldCheck, flask: FlaskConical, terminal: TerminalSquare, code: Code2 } as const;

export function Skills({ skills: skillGroups, headless }: { skills: SkillGroup[]; headless?: boolean }) {
  if (!skillGroups.length) return null;
  return (
    <section id="competences" className={`mx-auto max-w-6xl px-4 ${headless ? "pt-10" : "pt-28"}`}>
      {!headless && <SectionTitle eyebrow="// compétences" title="Ma stack technique" intro="Regroupée par domaine, et pratiquée en laboratoire." />}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g, i) => {
          const Icon = icons[g.icon as keyof typeof icons];
          return (
            <Reveal key={g.name} delay={i * 0.05} className="glass rounded-[2rem] p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-b from-ultra-500/60 to-ultra-700/60 shadow-[inset_0_1px_0_rgb(255_255_255/.35)]">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <h3 className="font-semibold">{g.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
