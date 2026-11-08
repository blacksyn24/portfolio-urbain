import "@fontsource/instrument-serif/400-italic.css";
import { ArrowRight, Download, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Settings } from "@/lib/types";
import { Reveal } from "../Reveal";
import { TrackedLink } from "../TrackedLink";

/**
 * Accueil « affiche » : portrait mis en lumière à gauche, présentation à droite.
 * Mise en page inspirée d'un modèle choisi par Urbain, aux couleurs du site.
 */
export function Hero({ settings: profile, badge }: { settings: Settings; badge?: { title: string; year: string } }) {
  const firstName = profile.first_name.split(" ")[0];

  return (
    <section id="accueil" className="mx-auto max-w-6xl px-4 pt-24 sm:pt-28">
      <div className="glass glass-dark relative overflow-hidden rounded-[2.5rem]">
        {/* Halo lumineux derrière le portrait */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 h-[130%] w-[85%] -translate-y-1/2 lg:w-[60%]"
          style={{
            background:
              "radial-gradient(closest-side, rgb(110 146 242 / .55), rgb(123 92 245 / .35) 45%, rgb(46 93 230 / .12) 70%, transparent)",
            filter: "blur(10px)",
          }}
        />

        <div className="relative grid items-center lg:min-h-[640px] lg:grid-cols-[1fr_1.1fr]">
          {/* Portrait fondu dans le halo */}
          <Reveal className="relative h-[380px] sm:h-[460px] lg:h-full lg:min-h-[640px]">
            <Image
              src={profile.photo_url}
              alt={`Portrait de ${profile.first_name} ${profile.last_name}`}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover object-[50%_18%]"
              style={{
                maskImage: "radial-gradient(ellipse 62% 70% at 50% 42%, #000 55%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 62% 70% at 50% 42%, #000 55%, transparent 100%)",
              }}
            />
            {badge && (
              <div className="glass glass-dark absolute bottom-5 left-1/2 flex w-max max-w-[88%] -translate-x-1/2 items-center gap-3 rounded-full py-2 pl-3 pr-5 lg:bottom-10">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ultra-300 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ultra-300" />
                </span>
                <span className="truncate text-xs text-ultra-50">
                  <span className="text-ultra-200/70">En cours · </span>
                  {badge.title}
                </span>
              </div>
            )}
          </Reveal>

          {/* Présentation */}
          <div className="relative px-6 pb-10 pt-4 sm:px-10 lg:py-16 lg:pl-4 lg:pr-14">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ultra-200">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {profile.availability}
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.4rem]">
                Salut, moi c&apos;est{" "}
                <span className="font-normal text-ultra-300" style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", letterSpacing: "-0.01em" }}>
                  {firstName}.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.22em] text-ultra-200/80 sm:text-[0.8rem]">{profile.title}</p>
              <p className="mt-1.5 text-sm text-ultra-200/55">{profile.subtitle}</p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-lg leading-relaxed text-ultra-200/85">{profile.tagline}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/projets" className="btn btn-primary">
                  Voir mes labs <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="btn btn-glass">
                  <Mail size={17} /> Me contacter
                </Link>
                {profile.cv_url && (
                  <TrackedLink event="cv_download" label="hero" href={profile.cv_url} target="_blank" rel="noopener" className="btn btn-glass !px-4" aria-label="Télécharger le CV">
                    <Download size={17} /> CV
                  </TrackedLink>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/8 pt-6 text-sm">
                {profile.highlights.map((h) => (
                  <span key={h.label} className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-white">{h.value}</span>
                    <span className="text-xs text-ultra-200/65">{h.label}</span>
                  </span>
                ))}
                <span className="flex items-center gap-1.5 text-xs text-ultra-200/65">
                  <MapPin size={13} /> {profile.location}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
