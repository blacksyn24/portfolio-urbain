"use client";

import { useState } from "react";

const BAR = "#6e92f2"; // une seule série : une seule teinte (contraste validé sur le fond sombre)

export function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="glass rounded-[1.75rem] p-5">
      <p className="text-sm text-ultra-200/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-ultra-200/55">{hint}</p>}
    </div>
  );
}

/** Histogramme vertical (une barre par jour) avec info-bulle au survol. */
export function DailyBars({ data, unit = "visites" }: { data: { label: string; value: number }[]; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const pad = { l: 34, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = niceMax(max);
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const slot = iw / Math.max(1, data.length);
  const gap = Math.min(6, Math.max(2, slot * 0.25));
  const bw = Math.max(1, slot - gap);
  const ticks = [0, nice / 2, nice];
  const every = Math.ceil(data.length / 8);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Histogramme des ${unit} par jour`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => {
          const y = pad.t + ih - (t / nice) * ih;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgb(255 255 255 / .08)" strokeWidth={1} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize={11} fill="rgb(175 197 248 / .55)">
                {t}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / nice) * ih;
          const x = pad.l + i * slot + gap / 2;
          const y = pad.t + ih - h;
          const r = Math.min(4, bw / 2, h);
          return (
            <g key={d.label}>
              {/* zone de survol plus large que la barre */}
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
              {h > 0 && <path d={roundedTop(x, y, bw, h, r)} fill={BAR} opacity={hover === null || hover === i ? 1 : 0.45} pointerEvents="none" />}
              {i % every === 0 && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="rgb(175 197 248 / .55)">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="glass glass-dark pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl px-3 py-1.5 text-xs"
          style={{ left: `${((pad.l + hover * slot + slot / 2) / W) * 100}%`, top: `${((pad.t + ih - (data[hover].value / nice) * ih) / H) * 100}%` }}
        >
          <span className="font-semibold text-white">{data[hover].value}</span> <span className="text-ultra-200/80">{unit} · {data[hover].label}</span>
        </div>
      )}
    </div>
  );
}

/** Classement horizontal (top N) : libellé + barre proportionnelle + valeur. */
export function RankList({ rows, empty = "Pas encore de données." }: { rows: { label: string; value: number }[]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-ultra-200/55">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label} : ${r.value}`}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate text-ultra-50">{r.label}</span>
            <span className="tabular-nums text-ultra-200/80">{r.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/6">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: BAR }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

function niceMax(v: number) {
  const steps = [2, 4, 10, 20, 40, 100, 200, 400, 1000, 2000, 5000, 10000];
  return steps.find((s) => s >= v) ?? Math.ceil(v / 1000) * 1000;
}

export function countBy<T>(items: T[], key: (t: T) => string, top = 6) {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    if (!k) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, top);
}

export function perDay(dates: string[], days: number) {
  const out: { label: string; value: number; key: string }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ key, label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), value: 0 });
  }
  const idx = new Map(out.map((o, i) => [o.key, i]));
  for (const iso of dates) {
    const i = idx.get(new Date(iso).toISOString().slice(0, 10));
    if (i !== undefined) out[i].value++;
  }
  return out;
}
