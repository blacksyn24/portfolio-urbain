import { Heart, Languages } from "lucide-react";
import type { Settings } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

export function About({ settings: profile }: { settings: Settings }) {
  return (
    <section id="apropos" className="mx-auto max-w-6xl px-4 pt-28">
      <SectionTitle eyebrow="// à propos" title="Apprendre en construisant" />
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Reveal className="glass rounded-[2.25rem] p-7 sm:p-9">
          <div className="space-y-4 text-[1.02rem] leading-relaxed text-ultra-200/90">
            {profile.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
        <div className="grid gap-5">
          <Reveal delay={0.06} className="glass rounded-[2.25rem] p-6">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Languages size={17} className="text-ultra-300" /> Langues
            </p>
            <ul className="space-y-2">
              {profile.languages.map((l) => (
                <li key={l.name} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2.5 text-sm">
                  {l.name} <span className="text-ultra-200/70">{l.level}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12} className="glass rounded-[2.25rem] p-6">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Heart size={17} className="text-ultra-300" /> Centres d&apos;intérêt
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="chip">
                  {i}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
