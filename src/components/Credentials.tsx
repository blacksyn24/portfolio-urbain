import { Award, BadgeCheck, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import type { Certification } from "@/lib/types";
import { fmtSize } from "@/lib/docs";
import { MediaCard } from "./MediaCard";
import { TrackedLink } from "./TrackedLink";

/** « 6 octobre 2026 », ou l'année si la date précise n'est pas connue. */
export function certDate(c: Pick<Certification, "issued_on" | "year">, style: "long" | "short" = "long") {
  if (!c.issued_on) return c.year;
  return new Date(`${c.issued_on}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: style === "long" ? "long" : "short", year: "numeric" });
}

/** Carte d'un certificat : aperçu du PDF, établissement, date, compétences et bouton pour l'ouvrir. */
export function CertificateCard({ c }: { c: Certification }) {
  return (
    <MediaCard
      images={c.certificate_preview_url ? [c.certificate_preview_url] : []}
      fallback={
        <div className="grid h-full w-full place-items-center">
          <FileText size={48} className="text-ultra-200/60" />
        </div>
      }
      href={c.certificate_url}
      title={c.name}
      subtitle={[c.academy || c.issuer, certDate(c)].filter(Boolean).join(" · ")}
      aside={c.status === "obtenue" ? <span className="flex items-center gap-1 text-ok" title="Obtenu"><BadgeCheck size={16} /></span> : undefined}
      description={c.description}
      badge={<span className="chip !bg-ink-950/80 backdrop-blur-md">{c.issuer}</span>}
      links={
        <>
          {c.credential_id && (
            <span className="font-mono" title={`Cert ID : ${c.credential_id}`}>
              ID {c.credential_id.slice(0, 8)}…
            </span>
          )}
          {c.credential_url && (
            <TrackedLink event="credential_click" label={`badge:${c.name}`} href={c.credential_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-white">
              <ShieldCheck size={13} /> Badge Credly
            </TrackedLink>
          )}
          {c.certificate_size > 0 && <span>PDF · {fmtSize(c.certificate_size)}</span>}
        </>
      }
      highlight={c.skills.length ? <span className="font-mono text-sm tracking-wide text-ultra-200">{c.skills.slice(0, 3).join(" · ")}</span> : undefined}
      cta={{ label: "Voir le certificat", href: c.certificate_url, external: true, event: "credential_click", eventLabel: `certificat:${c.name}` }}
    />
  );
}

/** Carte d'un badge numérique vérifiable (Credly…). */
export function BadgeCard({ c }: { c: Certification }) {
  return (
    <article className="glass glass-dark relative flex h-full flex-col items-center overflow-hidden rounded-[2rem] p-6 text-center sm:flex-row sm:items-center sm:gap-7 sm:p-7 sm:text-left">
      {/* Halo derrière le badge */}
      <div aria-hidden className="pointer-events-none absolute -left-10 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-ultra-500/30 blur-3xl" />
      <div className="relative shrink-0">
        {c.badge_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.badge_url} alt={`Badge ${c.name}`} className="h-36 w-36 rounded-[1.6rem] object-contain drop-shadow-[0_18px_30px_rgb(0_0_0/.45)]" />
        ) : (
          <span className="grid h-36 w-36 place-items-center rounded-[1.6rem] bg-gradient-to-b from-ultra-300/50 to-ultra-700/50">
            <Award size={48} />
          </span>
        )}
        <span className="absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-ok px-2.5 py-1 text-[0.7rem] font-semibold text-ink-950 shadow-lg">
          <BadgeCheck size={13} /> Vérifié
        </span>
      </div>
      <div className="relative mt-6 flex min-w-0 flex-1 flex-col sm:mt-0">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ultra-300">{c.issuer}</p>
        <h3 className="mt-1.5 text-xl font-semibold leading-snug text-white">{c.name}</h3>
        <p className="mt-1 text-sm text-ultra-200/70">Obtenu le {certDate(c)}</p>
        {c.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {c.skills.slice(0, 5).map((s) => (
              <span key={s} className="chip !text-[0.72rem]">
                {s}
              </span>
            ))}
          </div>
        )}
        {c.credential_url && (
          <TrackedLink
            event="credential_click"
            label={`badge:${c.name}`}
            href={c.credential_url}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 self-center rounded-full bg-white px-5 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5 sm:self-start"
          >
            Vérifier sur Credly <ExternalLink size={15} />
          </TrackedLink>
        )}
      </div>
    </article>
  );
}
