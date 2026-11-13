"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { track } from "@/lib/track";

type Cta = { label: string; href: string; download?: boolean; external?: boolean; event?: Parameters<typeof track>[0]; eventLabel?: string };

/**
 * Carte commune (projets, articles, ressources, certificats) :
 * la photo remplit toute la carte (défilable), les infos sont posées en bas sur un fond flouté.
 */
export function MediaCard({
  images,
  fallback,
  href,
  title,
  subtitle,
  aside,
  description,
  highlight,
  badge,
  corner,
  cta,
  links,
}: {
  images: string[];
  /** Visuel si aucune image */
  fallback?: React.ReactNode;
  href: string;
  title: string;
  subtitle?: string;
  /** À droite du titre (note, compteur, taille…) */
  aside?: React.ReactNode;
  description?: string;
  /** Ligne mise en avant au-dessus du bouton (technos, format…) */
  highlight?: React.ReactNode;
  /** Pastille en haut à gauche de l'image */
  badge?: React.ReactNode;
  /** Élément en haut à droite de l'image (ex. bouton j'aime) */
  corner?: React.ReactNode;
  cta: Cta;
  /** Petits liens secondaires sous la description */
  links?: React.ReactNode;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const dragged = useRef(false); // un glissement ne doit pas ouvrir la page
  const n = images.length;
  const go = (d: number) => {
    setDir(d);
    setI((x) => (x + d + n) % n);
  };
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onCta = () => cta.event && track(cta.event, cta.eventLabel ?? title);
  const ctaClass =
    "pointer-events-auto inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-4 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5 active:scale-[0.97]";

  return (
    <article className="group/media relative aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-ultra-700/60 via-ink-900/80 to-ink-950 shadow-[0_24px_60px_-28px_rgb(0_0_0/.8)] ring-1 ring-white/12 sm:aspect-[5/4]">
      {/* Photo plein cadre */}
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0"
        onClick={(e) => {
          if (dragged.current) {
            e.preventDefault();
            dragged.current = false;
          }
        }}
      >
        {n ? (
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.img
              key={images[i]}
              src={images[i]}
              alt=""
              loading="lazy"
              draggable={false}
              custom={dir}
              initial={{ x: `${dir * 100}%`, opacity: 0.4 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: `${-dir * 100}%`, opacity: 0.4 }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              drag={n > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) go(1);
                else if (info.offset.x > 50) go(-1);
                setTimeout(() => (dragged.current = false), 50);
              }}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </AnimatePresence>
        ) : (
          fallback
        )}
      </Link>

      {badge && <div className="pointer-events-none absolute left-4 top-4 z-10">{badge}</div>}
      {corner && <div className="absolute right-4 top-4 z-10">{corner}</div>}

      {/* Boutons pour faire défiler les photos */}
      {n > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => (stop(e), go(-1))}
            aria-label="Photo précédente"
            className="glass glass-dark absolute left-3 top-[38%] z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-white opacity-90 transition-opacity sm:opacity-0 sm:group-hover/media:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => (stop(e), go(1))}
            aria-label="Photo suivante"
            className="glass glass-dark absolute right-3 top-[38%] z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-white opacity-90 transition-opacity sm:opacity-0 sm:group-hover/media:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Infos posées sur la photo, fond flouté qui se fond vers le haut */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_top,black_62%,transparent)]" />
        <div className="relative px-5 pb-4 pt-14">
          {n > 1 && (
            <div className="mb-3 flex justify-center gap-1">
              {images.map((src, k) => (
                <span key={src} className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>
          )}
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white sm:text-xl">{title}</h3>
              {subtitle && <p className="mt-0.5 truncate text-sm text-ultra-200/75">{subtitle}</p>}
            </div>
            {aside && <div className="shrink-0 pb-0.5 text-sm text-ultra-50">{aside}</div>}
          </div>
          {highlight && <div className="mt-1.5 truncate">{highlight}</div>}
          {description && !highlight && <p className="mt-1.5 line-clamp-1 text-sm text-ultra-200/75">{description}</p>}
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/15 pt-3">
            <div className="pointer-events-auto flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs text-ultra-200/80">{links}</div>
            {cta.download || cta.external ? (
              <a href={cta.href} target={cta.external ? "_blank" : undefined} rel="noopener" onClick={onCta} className={ctaClass}>
                {cta.label}
              </a>
            ) : (
              <Link href={cta.href} onClick={onCta} className={ctaClass}>
                {cta.label} <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
