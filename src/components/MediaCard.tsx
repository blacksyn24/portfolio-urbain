"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { track } from "@/lib/track";

type Cta = { label: string; href: string; download?: boolean; external?: boolean; event?: Parameters<typeof track>[0]; eventLabel?: string };

/**
 * Carte commune (projets, articles, ressources) :
 * photos défilables en haut, infos en dessous, « Lire la suite » et grand bouton d'action.
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
  const [open, setOpen] = useState(false);
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
  const long = (description?.length ?? 0) > 120;

  const ctaClass =
    "mt-auto flex h-12 w-full items-center justify-center rounded-full bg-white text-[0.95rem] font-semibold text-ink-950 shadow-[0_10px_30px_-12px_rgb(255_255_255/.5)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]";
  const onCta = () => cta.event && track(cta.event, cta.eventLabel ?? title);

  return (
    <article className="glass glass-dark flex h-full flex-col overflow-hidden rounded-[2rem] p-2.5">
      {/* Photos */}
      <div className="group/media relative aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-ultra-700/60 via-ink-900/80 to-ink-950">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
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

        {badge && <div className="pointer-events-none absolute left-3 top-3">{badge}</div>}
        {corner && <div className="absolute right-3 top-3 z-10">{corner}</div>}

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => (stop(e), go(-1))}
              aria-label="Photo précédente"
              className="glass glass-dark absolute left-2.5 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white opacity-90 transition-opacity sm:opacity-0 sm:group-hover/media:opacity-100"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={(e) => (stop(e), go(1))}
              aria-label="Photo suivante"
              className="glass glass-dark absolute right-2.5 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white opacity-90 transition-opacity sm:opacity-0 sm:group-hover/media:opacity-100"
            >
              <ChevronRight size={17} />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
              {images.map((src, k) => (
                <span key={src} className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col px-3 pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-white">
            <Link href={href} className="hover:underline">
              {title}
            </Link>
          </h3>
          {aside && <div className="mt-1 shrink-0 text-sm text-ultra-50">{aside}</div>}
        </div>
        {subtitle && <p className="mt-0.5 text-sm text-ultra-200/60">{subtitle}</p>}

        {description && (
          <div className="mt-3 text-sm leading-relaxed text-ultra-200/85">
            <p className={open ? "" : "line-clamp-2"}>{description}</p>
            {long && (
              <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-ultra-200/60 underline underline-offset-2 hover:text-white">
                {open ? "Réduire" : "Lire la suite"}
              </button>
            )}
          </div>
        )}
        {links && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ultra-200/70">{links}</div>}

        {highlight && <div className="mb-4 mt-4 text-[0.95rem] font-semibold text-white">{highlight}</div>}
        {!highlight && <div className="mb-4" />}

        {cta.download || cta.external ? (
          <a href={cta.href} target={cta.external ? "_blank" : undefined} rel="noopener" onClick={onCta} className={ctaClass}>
            {cta.label}
          </a>
        ) : (
          <Link href={cta.href} onClick={onCta} className={ctaClass}>
            {cta.label}
          </Link>
        )}
      </div>
    </article>
  );
}
