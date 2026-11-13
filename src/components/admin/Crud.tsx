"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Eye, EyeOff, ImageOff, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useIsland } from "../IslandProvider";
import { useAdmin } from "./AdminProvider";
import { PageHeader } from "./Shell";

export type Field =
  | { name: string; label: string; type: "text" | "url" | "textarea"; required?: boolean; placeholder?: string; help?: string }
  | { name: string; label: string; type: "tags"; help?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { name: string; label: string; type: "bool" }
  | { name: string; label: string; type: "image"; folder: string }
  | { name: string; label: string; type: "gallery"; folder: string; coverField?: string }
  | { name: string; label: string; type: "pdf"; folder: string; nameField: string; sizeField: string; previewField: string }
  | { name: string; label: string; type: "markdown"; help?: string }
  | { name: string; label: string; type: "datetime" }
  | { name: string; label: string; type: "date" }
  | { name: string; label: string; type: "file"; folder: string; nameField: string; sizeField: string; accept?: string; maxMb?: number; previewField?: string };

type Row = Record<string, unknown> & { id: string; position: number; published: boolean };

type Props = {
  table: string;
  title: string;
  intro?: string;
  itemLabel: string;
  fields: Field[];
  /** Ligne principale et ligne secondaire affichées dans la liste. */
  primary: (r: Row) => string;
  secondary?: (r: Row) => string;
  /** Image de la carte (couverture, aperçu…). Sans cette fonction, les cartes sont compactes, sans photo. */
  image?: (r: Row) => string | undefined | null;
  /** Pastille colorée de la carte (catégorie, statut…). */
  badge?: (r: Row) => string | undefined | null;
  /** Texte de description sous le titre (2 lignes). */
  description?: (r: Row) => string | undefined | null;
  /** Lien « voir sur le site » de la carte. */
  link?: (r: Row) => string | undefined | null;
  defaults: Record<string, unknown>;
  /** Transformation avant enregistrement (ex. générer un slug). */
  beforeSave?: (v: Record<string, unknown>) => Record<string, unknown>;
};

export function Crud({ table, title, intro, itemLabel, fields, primary, secondary, image, badge, description, link, defaults, beforeSave }: Props) {
  const { db, publish, upload } = useAdmin();
  const { notify } = useIsland();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await db.from(table).select("*").order("position");
    if (error) notify({ title: "Chargement impossible", subtitle: error.message, tone: "error" });
    setRows((data as Row[]) ?? []);
  }, [db, table, notify]);

  useEffect(() => {
    load();
  }, [load]);

  // Le bouton « + » du dashboard ouvre directement le formulaire d'ajout (…?nouveau=1)
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("nouveau")) {
      setEditing({ ...defaults });
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function after(msg: string) {
    await load();
    await publish();
    notify({ title: msg, subtitle: "Le site est à jour", tone: "success" });
  }

  async function save() {
    if (!editing) return;
    for (const f of fields) {
      if ("required" in f && f.required && !String(editing[f.name] ?? "").trim()) {
        notify({ title: `« ${f.label} » est obligatoire`, tone: "error" });
        return;
      }
    }
    setSaving(true);
    const { id, created_at: _c, ...rest } = editing;
    const values = beforeSave ? beforeSave(rest) : rest;
    const res = id
      ? await db.from(table).update(values).eq("id", id as string)
      : await db.from(table).insert({ ...values, position: (rows?.length ?? 0) });
    setSaving(false);
    if (res.error) return notify({ title: "Enregistrement impossible", subtitle: res.error.message, tone: "error" });
    setEditing(null);
    await after(id ? `${itemLabel} modifié` : `${itemLabel} ajouté`);
  }

  async function remove(r: Row) {
    if (!confirm(`Supprimer « ${primary(r)} » ? Cette action est définitive.`)) return;
    const { error } = await db.from(table).delete().eq("id", r.id);
    if (error) return notify({ title: "Suppression impossible", subtitle: error.message, tone: "error" });
    await after(`${itemLabel} supprimé`);
  }

  async function togglePublished(r: Row) {
    const { error } = await db.from(table).update({ published: !r.published }).eq("id", r.id);
    if (error) return notify({ title: "Erreur", subtitle: error.message, tone: "error" });
    await after(r.published ? "Masqué du site" : "Publié sur le site");
  }

  async function move(index: number, dir: -1 | 1) {
    if (!rows) return;
    const a = rows[index];
    if (!rows[index + dir]) return;
    const reordered = [...rows];
    reordered.splice(index, 1);
    reordered.splice(index + dir, 0, a);
    await Promise.all(reordered.map((r, i) => (r.position !== i ? db.from(table).update({ position: i }).eq("id", r.id) : null)));
    await after("Ordre mis à jour");
  }

  return (
    <>
      <PageHeader
        title={title}
        intro={intro}
        action={
          <button onClick={() => setEditing({ ...defaults })} className="btn btn-primary">
            <Plus size={18} /> Ajouter
          </button>
        }
      />

      {!rows ? (
        <Loader2 className="animate-spin text-ultra-300" />
      ) : rows.length === 0 ? (
        <div className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">Aucun élément pour le moment.</div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label className="glass flex min-w-0 flex-1 items-center gap-2.5 rounded-full px-4 py-2.5 sm:max-w-sm">
              <Search size={16} className="shrink-0 text-ultra-200/60" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Rechercher (${rows.length})…`} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-ultra-200/50" />
              {q && (
                <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="text-ultra-200/60 hover:text-white">
                  <X size={15} />
                </button>
              )}
            </label>
            <span className="font-mono text-xs text-ultra-200/60">
              {rows.filter((r) => r.published).length} publié{rows.filter((r) => r.published).length > 1 ? "s" : ""} · {rows.filter((r) => !r.published).length} masqué{rows.filter((r) => !r.published).length > 1 ? "s" : ""}
            </span>
          </div>
          {(() => {
            const needle = q.trim().toLowerCase();
            const shown = rows.map((r, i) => ({ r, i })).filter(({ r }) => !needle || `${primary(r)} ${secondary?.(r) ?? ""} ${badge?.(r) ?? ""}`.toLowerCase().includes(needle));
            if (!shown.length) return <div className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">Aucun résultat pour « {q} ».</div>;
            return (
              <ul className={`grid gap-4 ${image ? "sm:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}`}>
                {shown.map(({ r, i }) => {
                  const src = image?.(r);
                  const tag = badge?.(r);
                  const desc = description?.(r);
                  const href = link?.(r);
                  return (
                    <li key={r.id} className={`glass flex flex-col overflow-hidden rounded-[2rem] p-2.5 transition-opacity ${r.published ? "" : "opacity-70"}`}>
                      {image && (
                        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-ultra-700/50 via-ink-900/70 to-ink-950">
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                          ) : (
                            <div className="grid h-full place-items-center text-ultra-200/40">
                              <ImageOff size={30} />
                            </div>
                          )}
                          {/* Coins : ordre à gauche, visibilité à droite */}
                          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                            <CardBtn label="Avancer dans la liste" onClick={() => move(i, -1)} disabled={i === 0 || !!needle}>
                              <ArrowLeft size={15} />
                            </CardBtn>
                            <CardBtn label="Reculer dans la liste" onClick={() => move(i, 1)} disabled={i === rows.length - 1 || !!needle}>
                              <ArrowRight size={15} />
                            </CardBtn>
                          </div>
                          <div className="absolute right-2.5 top-2.5">
                            <CardBtn label={r.published ? "Masquer du site" : "Publier sur le site"} onClick={() => togglePublished(r)} active={r.published}>
                              {r.published ? <Eye size={15} /> : <EyeOff size={15} />}
                            </CardBtn>
                          </div>
                          <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-ink-950/80 px-3 py-1 font-mono text-[0.7rem] text-ultra-50 backdrop-blur-md">
                            n° {i + 1} / {rows.length}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col px-3 pb-2 pt-4">
                        <p className="line-clamp-2 font-semibold leading-snug text-white">{primary(r)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {tag && <span className="rounded-full bg-ultra-500 px-2.5 py-0.5 text-xs font-semibold text-white">{tag}</span>}
                          {!r.published && <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-200">Masqué</span>}
                          {!image && <span className="font-mono text-[0.7rem] text-ultra-200/50">n° {i + 1}</span>}
                        </div>
                        {secondary && <p className="mt-2 line-clamp-2 text-sm text-ultra-200/70">{secondary(r)}</p>}
                        {desc && <p className="mt-1.5 line-clamp-2 text-sm text-ultra-200/55">{desc}</p>}
                        <div className="mt-auto flex items-center gap-2 pt-4">
                          <button type="button" onClick={() => setEditing({ ...r })} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
                            <Pencil size={15} /> Modifier
                          </button>
                          {!image && (
                            <>
                              <SquareBtn label="Avancer dans la liste" onClick={() => move(i, -1)} disabled={i === 0 || !!needle}>
                                <ArrowLeft size={16} />
                              </SquareBtn>
                              <SquareBtn label="Reculer dans la liste" onClick={() => move(i, 1)} disabled={i === rows.length - 1 || !!needle}>
                                <ArrowRight size={16} />
                              </SquareBtn>
                              <SquareBtn label={r.published ? "Masquer du site" : "Publier sur le site"} onClick={() => togglePublished(r)}>
                                {r.published ? <Eye size={16} /> : <EyeOff size={16} />}
                              </SquareBtn>
                            </>
                          )}
                          {href && (
                            <a href={href} target="_blank" rel="noopener" title="Voir sur le site" aria-label="Voir sur le site" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/8 text-ultra-100 ring-1 ring-white/12 hover:bg-white/15 hover:text-white">
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <SquareBtn label="Supprimer" onClick={() => remove(r)} danger>
                            <Trash2 size={16} />
                          </SquareBtn>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/60 p-3 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setEditing(null)}
          >
            <motion.form
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              className="glass glass-dark flex max-h-[92dvh] w-full max-w-xl flex-col rounded-[2rem]"
            >
              <div className="flex items-center justify-between border-b border-white/8 p-5">
                <h2 className="text-lg font-semibold">{editing.id ? `Modifier` : `Ajouter`} · {itemLabel.toLowerCase()}</h2>
                <IconBtn label="Fermer" onClick={() => setEditing(null)}>
                  <X size={18} />
                </IconBtn>
              </div>
              <div className="space-y-4 overflow-y-auto p-5">
                {fields.map((f) => (
                  <FieldInput
                    key={f.name}
                    field={f}
                    value={editing[f.name]}
                    onChange={(v) => setEditing((e) => ({ ...e, [f.name]: v }))}
                    patch={(o) => setEditing((e) => ({ ...e, ...o }))}
                    record={editing}
                    upload={upload}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-white/8 p-4">
                <button type="button" onClick={() => setEditing(null)} className="btn btn-glass">
                  Annuler
                </button>
                <button disabled={saving} className="btn btn-primary disabled:opacity-60">
                  {saving && <Loader2 size={16} className="animate-spin" />} Enregistrer
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Petit bouton rond posé sur la photo d'une carte. */
function CardBtn({ label, onClick, children, disabled, active }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-colors disabled:opacity-30 ${active ? "bg-ok/90 text-ink-950" : "bg-ink-950/75 text-white hover:bg-ink-950"}`}
    >
      {children}
    </button>
  );
}

/** Bouton carré de la rangée d'actions d'une carte. */
function SquareBtn({ label, onClick, children, disabled, danger }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 transition-colors disabled:opacity-30 ${danger ? "bg-red-500/10 text-red-300 ring-red-400/25 hover:bg-red-500/20" : "bg-white/8 text-ultra-100 ring-white/12 hover:bg-white/15 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

export function IconBtn({ label, onClick, children, disabled, danger }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-25 ${danger ? "text-red-300 hover:bg-red-500/15" : "text-ultra-200 hover:bg-white/10 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

export function FieldInput({
  field: f,
  value,
  onChange,
  patch,
  record,
  upload,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  patch?: (o: Record<string, unknown>) => void;
  record?: Record<string, unknown>;
  upload: (file: File, folder: string) => Promise<string>;
}) {
  const { notify } = useIsland();
  const [busy, setBusy] = useState(false);
  const label = <span className="mb-1.5 block text-sm text-ultra-200/80">{f.label}</span>;

  if (f.type === "bool")
    return (
      <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
        <span className="text-sm">{f.label}</span>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#2e5de6]" />
      </label>
    );
  if (f.type === "select")
    return (
      <label className="block">
        {label}
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field">
          {f.options.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-950">
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  if (f.type === "tags")
    return (
      <label className="block">
        {label}
        <input
          defaultValue={((value as string[]) ?? []).join(", ")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          className="field"
          placeholder="Séparés par des virgules"
        />
        {f.help && <span className="mt-1 block text-xs text-ultra-200/50">{f.help}</span>}
      </label>
    );
  if (f.type === "pdf") {
    const url = String(value ?? "");
    const preview = String(record?.[f.previewField] ?? "");
    const name = String(record?.[f.nameField] ?? "");
    return (
      <div>
        {label}
        <div className="flex flex-wrap items-center gap-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Aperçu de la 1re page" className="h-24 w-[4.5rem] rounded-lg bg-white object-cover object-top shadow" />
          ) : (
            <div className="grid h-24 w-[4.5rem] place-items-center rounded-lg bg-white/5 text-xs text-ultra-200/40">PDF</div>
          )}
          <div className="flex flex-col gap-2">
            <label className="btn btn-glass cursor-pointer !py-2 text-sm">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {url ? "Remplacer le PDF" : "Ajouter un PDF"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (file.type !== "application/pdf") return notify({ title: "Ce fichier n'est pas un PDF", tone: "error" });
                  if (file.size > 45 * 1024 * 1024) return notify({ title: "PDF trop lourd", subtitle: "45 Mo maximum", tone: "error" });
                  setBusy(true);
                  try {
                    const pdfUrl = await upload(file, f.folder);
                    let previewUrl = "";
                    try {
                      const { pdfFirstPage } = await import("@/lib/pdfPreview");
                      const blob = await pdfFirstPage(file);
                      previewUrl = await upload(new File([blob], file.name.replace(/\.pdf$/i, "") + "-apercu.webp", { type: "image/webp" }), `${f.folder}/apercus`);
                    } catch (err) {
                      console.error(err);
                      notify({ title: "PDF envoyé, aperçu impossible", subtitle: "Le PDF reste téléchargeable", tone: "info" });
                    }
                    onChange(pdfUrl);
                    patch?.({ [f.nameField]: file.name, [f.sizeField]: file.size, [f.previewField]: previewUrl });
                    if (previewUrl) notify({ title: "PDF ajouté", subtitle: "Aperçu de la 1re page généré", tone: "success" });
                  } catch (err) {
                    notify({ title: "Envoi impossible", subtitle: err instanceof Error ? err.message : "", tone: "error" });
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            {url && (
              <span className="flex items-center gap-3 text-sm">
                <a href={url} target="_blank" className="max-w-[14rem] truncate text-ultra-300 underline">
                  {name || "Voir le PDF"}
                </a>
                <button type="button" onClick={() => { onChange(""); patch?.({ [f.nameField]: "", [f.sizeField]: 0, [f.previewField]: "" }); }} className="text-red-300">
                  Retirer
                </button>
              </span>
            )}
          </div>
        </div>
        <span className="mt-1 block text-xs text-ultra-200/50">L&apos;aperçu de la 1re page sert de couverture si l&apos;article n&apos;a pas d&apos;image.</span>
      </div>
    );
  }
  if (f.type === "gallery") {
    const list = (value as string[]) ?? [];
    const cover = f.coverField ? String(record?.[f.coverField] ?? "") : "";
    const move = (i: number, d: number) => {
      const next = [...list];
      const [x] = next.splice(i, 1);
      next.splice(i + d, 0, x);
      onChange(next);
    };
    return (
      <div>
        {label}
        {list.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2">
            {list.map((src, i) => (
              <li key={src} className="group relative overflow-hidden rounded-xl bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                {cover === src && <span className="absolute left-1 top-1 rounded-full bg-ultra-500 px-2 py-0.5 text-[0.6rem] font-semibold">Couverture</span>}
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                  <span className="flex gap-1">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-full bg-ink-950/80 text-xs disabled:opacity-30" aria-label="Avant">
                      ←
                    </button>
                    <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-ink-950/80 text-xs disabled:opacity-30" aria-label="Après">
                      →
                    </button>
                  </span>
                  <span className="flex gap-1">
                    {f.coverField && cover !== src && (
                      <button type="button" onClick={() => patch?.({ [f.coverField!]: src })} className="h-7 rounded-full bg-ink-950/80 px-2 text-[0.6rem]" title="Utiliser comme couverture de la carte">
                        ★ Couv.
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onChange(list.filter((x) => x !== src));
                        if (f.coverField && cover === src) patch?.({ [f.coverField]: "" });
                      }}
                      className="grid h-7 w-7 place-items-center rounded-full bg-red-500/85 text-xs"
                      aria-label="Retirer la photo"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <label className="btn btn-glass cursor-pointer !py-2 text-sm">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} Ajouter des photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = [...(e.target.files ?? [])];
              e.target.value = "";
              if (!files.length) return;
              const tooBig = files.filter((x) => x.size > 8 * 1024 * 1024);
              if (tooBig.length) notify({ title: `${tooBig.length} photo(s) trop lourde(s)`, subtitle: "8 Mo maximum par photo", tone: "error" });
              setBusy(true);
              const added: string[] = [];
              for (const file of files.filter((x) => x.size <= 8 * 1024 * 1024)) {
                try {
                  added.push(await upload(file, f.folder));
                } catch (err) {
                  notify({ title: "Envoi impossible", subtitle: `${file.name} : ${err instanceof Error ? err.message : ""}`, tone: "error" });
                }
              }
              setBusy(false);
              if (added.length) {
                onChange([...list, ...added]);
                if (f.coverField && !cover) patch?.({ [f.coverField]: added[0] });
                notify({ title: `${added.length} photo(s) ajoutée(s)`, subtitle: "Pensez à enregistrer", tone: "success" });
              }
            }}
          />
        </label>
        <span className="mt-1 block text-xs text-ultra-200/50">Plusieurs photos possibles d&apos;un coup (8 Mo max chacune). La photo « Couverture » s&apos;affiche sur la carte du projet.</span>
      </div>
    );
  }
  if (f.type === "datetime") {
    const v = value ? new Date(String(value)) : new Date();
    const local = new Date(v.getTime() - v.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return (
      <label className="block">
        {label}
        <input type="datetime-local" value={local} onChange={(e) => onChange(new Date(e.target.value).toISOString())} className="field" />
      </label>
    );
  }
  if (f.type === "date") {
    return (
      <label className="block">
        {label}
        <input type="date" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value || null)} className="field" />
      </label>
    );
  }
  if (f.type === "markdown")
    return (
      <label className="block">
        {label}
        <textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={16} className="field resize-y font-mono text-sm" placeholder={"## Objectif\n\nTexte de l'article…\n\n```\nRouter(config)# interface g0/0\n```"} />
        <span className="mt-1 block text-xs text-ultra-200/50">
          {f.help ?? "Mise en forme : ## Titre · **gras** · - liste · [lien](https://…) · ![image](https://…) · ``` code ```"}
        </span>
      </label>
    );
  if (f.type === "file")
    return (
      <div>
        {label}
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn btn-glass cursor-pointer !py-2 text-sm">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {value ? "Remplacer le fichier" : "Choisir un fichier"}
            <input
              type="file"
              accept={f.accept}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const max = (f.maxMb ?? 45) * 1024 * 1024;
                if (file.size > max) return notify({ title: "Fichier trop lourd", subtitle: `${f.maxMb ?? 45} Mo maximum`, tone: "error" });
                setBusy(true);
                try {
                  const url = await upload(file, f.folder);
                  // Pour un PDF, on génère aussi l'aperçu de la 1re page (sert de couverture)
                  let previewUrl = "";
                  if (f.previewField && /\.pdf$/i.test(file.name)) {
                    try {
                      const { pdfFirstPage } = await import("@/lib/pdfPreview");
                      const blob = await pdfFirstPage(file);
                      previewUrl = await upload(new File([blob], file.name.replace(/\.pdf$/i, "") + "-apercu.webp", { type: "image/webp" }), `${f.folder}/apercus`);
                    } catch (err) {
                      console.error(err);
                    }
                  }
                  onChange(url);
                  patch?.({ [f.nameField]: file.name, [f.sizeField]: file.size, ...(f.previewField ? { [f.previewField]: previewUrl } : {}) });
                  notify({ title: "Fichier envoyé", subtitle: previewUrl ? "Aperçu de la 1re page généré" : file.name, tone: "success" });
                } catch (err) {
                  notify({ title: "Envoi impossible", subtitle: err instanceof Error ? err.message : "", tone: "error" });
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {f.previewField && String(record?.[f.previewField] ?? "") && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(record?.[f.previewField])} alt="Aperçu de la 1re page" className="h-16 w-12 rounded-md bg-white object-cover object-top shadow" />
          )}
          {Boolean(value) && (
            <a href={String(value)} target="_blank" className="truncate text-sm text-ultra-300 underline">
              Voir le fichier actuel
            </a>
          )}
        </div>
      </div>
    );
  if (f.type === "image")
    return (
      <div>
        {label}
        <div className="flex items-center gap-3">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(value)} alt="" className="h-16 w-24 rounded-xl object-cover" />
          ) : (
            <div className="grid h-16 w-24 place-items-center rounded-xl bg-white/5 text-ultra-200/40">
              <ImagePlus size={20} />
            </div>
          )}
          <label className="btn btn-glass cursor-pointer !py-2 text-sm">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} Choisir une image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) return notify({ title: "Image trop lourde", subtitle: "5 Mo maximum", tone: "error" });
                setBusy(true);
                try {
                  onChange(await upload(file, f.folder));
                } catch (err) {
                  notify({ title: "Envoi impossible", subtitle: err instanceof Error ? err.message : "", tone: "error" });
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {Boolean(value) && (
            <button type="button" onClick={() => onChange("")} className="text-sm text-red-300">
              Retirer
            </button>
          )}
        </div>
      </div>
    );
  return (
    <label className="block">
      {label}
      {f.type === "textarea" ? (
        <textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={4} className="field resize-y" placeholder={f.placeholder} />
      ) : (
        <input type={f.type} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="field" placeholder={f.placeholder} />
      )}
      {f.help && <span className="mt-1 block text-xs text-ultra-200/50">{f.help}</span>}
    </label>
  );
}
