import { ArrowRight, Award, BadgeCheck, Briefcase, GraduationCap, Hourglass, Trophy, Wrench } from "lucide-react";
import Link from "next/link";
import { certDate } from "../Credentials";
import type { Certification, TimelineItem } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

const kindIcon = { formation: GraduationCap, competition: Trophy, projet: Wrench, experience: Briefcase } as const;

export function Journey({ timeline, certifications, headless }: { timeline: TimelineItem[]; certifications: Certification[]; headless?: boolean }) {
  if (!timeline.length && !certifications.length) return null;
  return (
    <section id="parcours" className={`mx-auto max-w-6xl px-4 ${headless ? "pt-10" : "pt-28"}`}>
      {!headless && <SectionTitle eyebrow="// parcours" title="Formation, expériences & certifications" />}
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

        <div className="flex flex-col gap-4">
          {certifications.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <Link href="/certifications" className="glass group flex items-center gap-4 rounded-[1.8rem] p-4 transition-transform hover:-translate-y-0.5">
                {c.badge_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.badge_url} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-contain" />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-ultra-300/50 to-ultra-700/50 shadow-[inset_0_1px_0_rgb(255_255_255/.4)]">
                    <Award size={24} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug">{c.name}</h3>
                  <p className="mt-0.5 text-sm text-ultra-200/70">
                    {c.academy || c.issuer} · {certDate(c, "short")}
                  </p>
                  {c.status === "obtenue" ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-ok">
                      <BadgeCheck size={13} /> {c.badge_url ? "Badge vérifié" : "Certificat obtenu"}
                    </span>
                  ) : (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs text-ultra-200">
                      <Hourglass size={13} /> {c.status === "en-cours" ? "En cours" : "Planifiée"}
                    </span>
                  )}
                </div>
                <ArrowRight size={17} className="shrink-0 text-ultra-200/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            </Reveal>
          ))}
          {certifications.length > 0 && (
            <Link href="/certifications" className="btn btn-glass justify-center">
              Voir les certificats & badges <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
