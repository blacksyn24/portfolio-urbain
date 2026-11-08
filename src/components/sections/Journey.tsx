import { Award, BadgeCheck, Briefcase, GraduationCap, Hourglass, Trophy, Wrench } from "lucide-react";
import type { Certification, TimelineItem } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

const kindIcon = { formation: GraduationCap, competition: Trophy, projet: Wrench, experience: Briefcase } as const;

export function Journey({ timeline, certifications }: { timeline: TimelineItem[]; certifications: Certification[] }) {
  if (!timeline.length && !certifications.length) return null;
  return (
    <section id="parcours" className="mx-auto max-w-6xl px-4 pt-28">
      <SectionTitle eyebrow="// parcours" title="Formation, expériences & certifications" />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Reveal className="glass rounded-[2.25rem] p-6 sm:p-8">
          <ol className="relative space-y-7 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-gradient-to-b before:from-ultra-300/60 before:to-transparent">
            {timeline.map((t) => {
              const Icon = kindIcon[t.kind];
              return (
                <li key={t.title} className="relative flex gap-4">
                  <span
                    className={`z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      t.current ? "bg-ultra-500 shadow-[0_0_24px_rgb(46_93_230/.8)]" : "bg-ink-900 ring-1 ring-white/15"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <div className="pt-1">
                    <p className="font-mono text-xs text-ultra-300">{t.period}</p>
                    <h3 className="mt-1 font-semibold leading-snug">{t.title}</h3>
                    <p className="text-sm text-ultra-200/75">{t.place}</p>
                    {t.detail && <p className="mt-1 text-sm text-ultra-200/60">{t.detail}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <div className="flex flex-col gap-5">
          {certifications.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06} className="glass rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-ultra-300/50 to-ultra-700/50 shadow-[inset_0_1px_0_rgb(255_255_255/.4)]">
                  <Award size={22} />
                </span>
                {c.status === "obtenue" ? (
                  <span className="chip !bg-ok/15 !text-ok">
                    <BadgeCheck size={14} /> Badge vérifié
                  </span>
                ) : (
                  <span className="chip !text-ultra-200">
                    <Hourglass size={14} /> {c.status === "en-cours" ? "En cours" : "Planifiée"}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-semibold leading-snug">{c.name}</h3>
              <p className="mt-1 text-sm text-ultra-200/70">
                {c.issuer} · {c.year}
              </p>
              {c.credential_url && (
                <a href={c.credential_url} target="_blank" rel="noopener" className="mt-3 inline-block text-sm text-ultra-300 underline hover:text-white">
                  Vérifier le badge
                </a>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
