import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, MapPin } from "lucide-react";
import type { Settings } from "@/lib/types";
import { Reveal } from "../Reveal";
import { TrackedLink } from "../TrackedLink";

export function Hero({ settings: profile, badge }: { settings: Settings; badge?: { title: string; year: string } }) {
  return (
    <section id="accueil" className="mx-auto grid max-w-6xl gap-5 px-4 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_1fr]">
      <Reveal className="glass glass-strong flex flex-col justify-between rounded-[2.5rem] p-7 sm:p-10">
        <div>
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {profile.availability}
            </span>
            <span className="chip font-mono text-ultra-200">@{profile.handle}</span>
          </div>
          <h1 className="text-gradient text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {profile.first_name}
            <br />
            <span className="font-bold">{profile.last_name}</span>
          </h1>
          <p className="mt-5 text-lg font-medium text-ultra-50 sm:text-xl">{profile.title}</p>
          <p className="mt-1 font-mono text-xs text-ultra-300 sm:text-sm">{profile.subtitle}</p>
          <p className="mt-6 max-w-xl leading-relaxed text-ultra-200/85">{profile.tagline}</p>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/projets" className="btn btn-primary">
            Voir mes labs <ArrowRight size={18} />
          </Link>
          {profile.cv_url && (
            <TrackedLink event="cv_download" label="hero" href={profile.cv_url} target="_blank" rel="noopener" className="btn btn-glass">
              <Download size={18} /> Télécharger le CV
            </TrackedLink>
          )}
          <span className="flex items-center gap-1.5 text-sm text-ultra-200/70">
            <MapPin size={15} /> {profile.location}
          </span>
        </div>
      </Reveal>

      <div className="grid gap-5">
        <Reveal delay={0.08} className="glass relative min-h-[420px] overflow-hidden rounded-[2.5rem] p-2">
          <div className="relative h-full min-h-[404px] overflow-hidden rounded-[2.1rem]">
            <Image
              src={profile.photo_url}
              alt={`Portrait de ${profile.first_name} ${profile.last_name}`}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover object-[50%_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/5 to-transparent" />
            {badge && (
              <div className="glass glass-dark absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[1.6rem] px-5 py-3.5">
                <div>
                  <p className="text-xs text-ultra-200/80">En cours</p>
                  <p className="text-sm font-semibold">{badge.title}</p>
                </div>
                <span className="font-mono text-xs text-ultra-300">{badge.year}</span>
              </div>
            )}
          </div>
        </Reveal>
        <div className="grid grid-cols-3 gap-3">
          {profile.highlights.map((h, i) => (
            <Reveal key={h.label} delay={0.14 + i * 0.05} className="glass rounded-[1.75rem] p-4">
              <p className="text-2xl font-semibold text-white sm:text-3xl">{h.value}</p>
              <p className="mt-1 text-[0.72rem] leading-snug text-ultra-200/80 sm:text-xs">{h.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
