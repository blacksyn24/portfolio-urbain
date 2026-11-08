"use client";

import { useMemo, useState } from "react";
import { downloadUrl, fmtSize } from "@/lib/docs";
import { DocCover } from "./Covers";
import { MediaCard } from "./MediaCard";
import type { DocumentItem } from "@/lib/types";

const ext = (name: string) => name.split(".").pop()?.toUpperCase() ?? "FICHIER";


export function DocumentsList({ documents }: { documents: DocumentItem[] }) {
  const cats = useMemo(() => ["Tous", ...Array.from(new Set(documents.map((d) => d.category)))], [documents]);
  const [cat, setCat] = useState("Tous");
  const [q, setQ] = useState("");
  const list = documents.filter((d) => (cat === "Tous" || d.category === cat) && (`${d.title} ${d.description}`.toLowerCase().includes(q.toLowerCase())));

  if (!documents.length)
    return <p className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">Les premiers documents arrivent bientôt.</p>;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {cats.length > 2 && (
          <div className="glass flex flex-wrap rounded-full p-1">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${cat === c ? "bg-white/15 text-white" : "text-ultra-200/75 hover:text-white"}`}>
                {c}
              </button>
            ))}
          </div>
        )}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un document…" className="field !w-auto min-w-0 flex-1 !rounded-full" aria-label="Rechercher" />
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <li key={d.id}>
            <MediaCard
              images={[]}
              fallback={<DocCover fileName={d.file_name} category={d.category} />}
              href={downloadUrl(d)}
              title={d.title}
              subtitle={d.category}
              aside={fmtSize(d.file_size) ? <span className="text-ultra-200/80">{fmtSize(d.file_size)}</span> : undefined}
              description={d.description}
              highlight={<span className="font-mono text-sm tracking-wide text-ultra-200">{ext(d.file_name)}</span>}
              cta={{ label: "Télécharger", href: downloadUrl(d), download: true, event: "document_download", eventLabel: d.title }}
            />
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-4 text-center text-sm text-ultra-200/60">Aucun document ne correspond.</p>}
    </>
  );
}
