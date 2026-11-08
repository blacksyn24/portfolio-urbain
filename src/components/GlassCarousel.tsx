"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, ExternalLink, Link2, Maximize2, Share2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

export type CarouselItem = {
  key: string;
  title: string;
  /** Petite ligne sous le titre (catégorie, date…) */
  meta?: string;
  description?: string;
  image?: string;
  /** Visuel de remplacement quand il n'y a pas d'image */
  cover?: React.ReactNode;
  href: string;
  /** Action secondaire (GitHub, téléchargement…) */
  action?: { label: string; href: string; download?: boolean; event?: Parameters<typeof track>[0]; eventLabel?: string };
  /** Initiale ou court texte affiché dans la mini-barre quand il n'y a pas d'image */
  thumbText?: string;
};

const spring = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;

/** Carrousel 3D façon « visionOS » : carte centrale nette, voisines en perspective. */
export function GlassCarousel({ items, label, openLabel = "Agrandir" }: { items: CarouselItem[]; label: string; openLabel?: string }) {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [side, setSide] = useState(2); // cartes visibles de chaque côté
  const root = useRef<HTMLDivElement>(null);
  const n = items.length;

  const go = useCallback((d: number) => setIndex((i) => (i + d + n) % n), [n]);

  useEffect(() => {
    const update = () => setSide(window.innerWidth < 640 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!n) return null;
  const current = items[index];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const absolute = (href: string) => (href.startsWith("http") ? href : `${location.origin}${href}`);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absolute(current.href));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  const share = async () => {
    const url = absolute(current.href);
    if (navigator.share) await navigator.share({ title: current.title, url }).catch(() => {});
    else copy();
  };

  return (
    <section
      ref={root}
      aria-roledescription="carrousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      className="relative mx-auto max-w-6xl select-none overflow-x-clip px-4 pt-10 outline-none"
    >
      {/* Barre d'actions verticale */}
      <div className="glass glass-dark absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 rounded-full p-1.5 md:flex">
        <SideBtn label={copied ? "Lien copié" : "Copier le lien"} onClick={copy}>
          {copied ? <Check size={17} /> : <Link2 size={17} />}
        </SideBtn>
        <SideBtn label="Partager" onClick={share}>
          <Share2 size={17} />
        </SideBtn>
        {current.action && (
          <a
            href={current.action.href}
            target={current.action.download ? undefined : "_blank"}
            rel="noopener"
            onClick={() => current.action?.event && track(current.action.event, current.action.eventLabel ?? current.title)}
            title={current.action.label}
            aria-label={current.action.label}
            className="grid h-10 w-10 place-items-center rounded-full text-ultra-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={17} />
          </a>
        )}
      </div>

      {/* Scène 3D */}
      <div className="relative mx-auto h-[470px] sm:h-[500px]" style={{ perspective: 1400 }}>
        <motion.div className="absolute inset-0" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragEnd={onDragEnd}>
          {items.map((it, i) => {
            let off = i - index;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const visible = abs <= side;
            return (
              <motion.article
                key={it.key}
                initial={false}
                animate={{
                  x: `calc(-50% + ${off * (side === 1 ? 74 : 58)}%)`,
                  rotateY: off * -24,
                  z: -abs * 160,
                  scale: 1 - abs * 0.14,
                  opacity: visible ? 1 - abs * (side === 1 ? 0.6 : 0.22) : 0,
                  filter: abs ? `blur(${abs * 0.8}px) brightness(${1 - abs * 0.18})` : "blur(0px) brightness(1)",
                }}
                transition={spring}
                style={{
                  zIndex: 20 - abs,
                  transformStyle: "preserve-3d",
                  pointerEvents: visible ? "auto" : "none",
                  // verre plus dense : les cartes voisines ne transparaissent pas à travers
                  background: "linear-gradient(140deg, rgb(37 66 170 / .94), rgb(12 22 72 / .96) 55%, rgb(28 30 110 / .95))",
                }}
                className="glass glass-strong absolute left-1/2 top-0 flex h-[440px] w-[min(78vw,340px)] flex-col overflow-hidden rounded-[2rem] sm:h-[470px] sm:w-[360px]"
                onClick={() => off !== 0 && go(off)}
                aria-hidden={off !== 0}
              >
                <div className="relative m-2 h-[52%] overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-ultra-700/60 via-ink-900/70 to-ink-950">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" draggable={false} className="h-full w-full object-cover" />
                  ) : (
                    it.cover
                  )}
                  {off === 0 && (
                    <Link
                      href={it.href}
                      className="glass glass-dark absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
                    >
                      <Maximize2 size={13} /> {openLabel}
                    </Link>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-white">{it.title}</h3>
                    <span className="mt-1 shrink-0 font-mono text-xs text-ultra-200/70">
                      {i + 1} / {n}
                    </span>
                  </div>
                  {it.meta && <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-ultra-300">{it.meta}</p>}
                  {it.description && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ultra-200/80">{it.description}</p>}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {/* Mini-barre façon Dynamic Island */}
      <div className="glass glass-dark relative z-30 mx-auto mt-2 flex w-full max-w-md items-center gap-3 rounded-full p-2">
        <SideBtn label="Précédent" onClick={() => go(-1)}>
          <ChevronLeft size={19} />
        </SideBtn>
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ultra-700/60 ring-1 ring-white/15">
          {current.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center font-mono text-[0.65rem] font-semibold text-ultra-50">{current.thumbText ?? current.title.slice(0, 2)}</span>
          )}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="min-w-0 flex-1">
            <Link href={current.href} className="block truncate text-sm font-semibold text-white hover:underline">
              {current.title}
            </Link>
            <p className="truncate text-xs text-ultra-200/70">{current.meta}</p>
          </motion.div>
        </AnimatePresence>
        <SideBtn label="Suivant" onClick={() => go(1)}>
          <ChevronRight size={19} />
        </SideBtn>
      </div>

      {/* Points */}
      <div className="mt-4 flex justify-center gap-1.5" role="tablist" aria-label="Choisir un élément">
        {items.map((it, i) => (
          <button
            key={it.key}
            role="tab"
            aria-selected={i === index}
            aria-label={it.title}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-ultra-300" : "w-1.5 bg-white/25 hover:bg-white/45"}`}
          />
        ))}
      </div>
    </section>
  );
}

function SideBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ultra-200 transition-colors hover:bg-white/10 hover:text-white">
      {children}
    </button>
  );
}
