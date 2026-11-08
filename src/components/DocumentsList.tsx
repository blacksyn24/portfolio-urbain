"use client";

import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { track } from "@/lib/track";
import { downloadUrl, fmtSize } from "@/lib/docs";
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
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((d) => (
          <li key={d.id} className="glass flex items-start gap-4 rounded-[1.8rem] p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-ultra-500/60 to-ultra-700/60 shadow-[inset_0_1px_0_rgb(255_255_255/.35)]">
              <FileText size={21} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-snug">{d.title}</h3>
              {d.description && <p className="mt-1 text-sm leading-relaxed text-ultra-200/75">{d.description}</p>}
              <p className="mt-2 font-mono text-xs text-ultra-300">
                {d.category} · {ext(d.file_name)} {fmtSize(d.file_size) && `· ${fmtSize(d.file_size)}`}
              </p>
            </div>
            <a href={downloadUrl(d)} onClick={() => track("document_download", d.title)} className="btn btn-primary shrink-0 !px-3.5 !py-2.5" aria-label={`Télécharger ${d.title}`}>
              <Download size={17} />
            </a>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-4 text-center text-sm text-ultra-200/60">Aucun document ne correspond.</p>}
    </>
  );
}
