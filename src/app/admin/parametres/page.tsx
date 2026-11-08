"use client";

import { FileUp, KeyRound, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { FieldInput } from "@/components/admin/Crud";
import { PageHeader } from "@/components/admin/Shell";
import { useIsland } from "@/components/IslandProvider";
import type { Settings } from "@/lib/types";

export default function ParametresPage() {
  const { db, publish, upload } = useAdmin();
  const { notify } = useIsland();
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);

  useEffect(() => {
    db.from("settings").select("*").eq("id", 1).single().then(({ data }) => setS(data as Settings));
  }, [db]);

  if (!s) return <Loader2 className="animate-spin text-ultra-300" />;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  async function save() {
    if (!s) return;
    setSaving(true);
    const { chatbot_enabled: _a, chatbot_instructions: _b, ...rest } = s;
    const { error } = await db.from("settings").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) return notify({ title: "Enregistrement impossible", subtitle: error.message, tone: "error" });
    await publish();
    notify({ title: "Profil enregistré", subtitle: "Le site est à jour", tone: "success" });
  }

  async function uploadCv(file: File) {
    if (file.type !== "application/pdf") return notify({ title: "Le CV doit être un PDF", tone: "error" });
    if (file.size > 8 * 1024 * 1024) return notify({ title: "PDF trop lourd", subtitle: "8 Mo maximum", tone: "error" });
    setCvBusy(true);
    try {
      set("cv_url", await upload(file, "cv"));
      notify({ title: "CV envoyé", subtitle: "Pensez à enregistrer", tone: "success" });
    } catch (e) {
      notify({ title: "Envoi impossible", subtitle: e instanceof Error ? e.message : "", tone: "error" });
    } finally {
      setCvBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const pw = String(new FormData(form).get("pw"));
    if (pw.length < 10) return notify({ title: "10 caractères minimum", tone: "error" });
    const { error } = await db.auth.updateUser({ password: pw });
    if (error) return notify({ title: "Changement impossible", subtitle: error.message, tone: "error" });
    form.reset();
    notify({ title: "Mot de passe changé", tone: "success" });
  }

  const text = (k: keyof Settings, label: string, type: "text" | "textarea" | "url" = "text", help?: string) => (
    <FieldInput field={{ name: k, label, type, help }} value={s[k]} onChange={(v) => set(k, v as never)} upload={upload} />
  );

  return (
    <>
      <PageHeader
        title="Paramètres"
        intro="Votre profil tel qu'il apparaît sur le site."
        action={
          <button onClick={save} disabled={saving} className="btn btn-primary disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass space-y-4 rounded-[2rem] p-6">
          <h2 className="font-semibold">Identité</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {text("first_name", "Prénoms")}
            {text("last_name", "Nom")}
          </div>
          {text("handle", "Pseudo")}
          {text("title", "Titre")}
          {text("subtitle", "Sous-titre (formation)")}
          {text("tagline", "Accroche", "textarea")}
          {text("availability", "Disponibilité", "text", "Affichée en haut de la page et dans le contact")}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("location", "Localisation")}
            {text("email", "Email public")}
          </div>
        </section>

        <div className="space-y-5">
          <section className="glass space-y-4 rounded-[2rem] p-6">
            <h2 className="font-semibold">Photo & CV</h2>
            <FieldInput field={{ name: "photo_url", label: "Photo de profil", type: "image", folder: "photos" }} value={s.photo_url} onChange={(v) => set("photo_url", String(v) || "/images/urbain.jpg")} upload={upload} />
            <div>
              <span className="mb-1.5 block text-sm text-ultra-200/80">CV (PDF)</span>
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn btn-glass cursor-pointer !py-2 text-sm">
                  {cvBusy ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />} {s.cv_url ? "Remplacer le CV" : "Ajouter le CV"}
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCv(e.target.files[0])} />
                </label>
                {s.cv_url ? (
                  <>
                    <a href={s.cv_url} target="_blank" className="text-sm text-ultra-300 underline">Voir le CV actuel</a>
                    <button onClick={() => set("cv_url", "")} className="text-sm text-red-300">Retirer</button>
                  </>
                ) : (
                  <span className="text-sm text-ultra-200/55">Aucun CV : le bouton « Télécharger le CV » est masqué.</span>
                )}
              </div>
              <span className="mt-1 block text-xs text-ultra-200/50">Utilisez une version sans date de naissance ni situation familiale : ce fichier est public.</span>
            </div>
          </section>

          <section className="glass space-y-4 rounded-[2rem] p-6">
            <h2 className="font-semibold">Liens (LinkedIn, GitHub…)</h2>
            {s.socials.map((so, i) => (
              <div key={i} className="flex gap-2">
                <input value={so.label} onChange={(e) => set("socials", s.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="field !w-32" placeholder="LinkedIn" />
                <input value={so.url} onChange={(e) => set("socials", s.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} className="field" placeholder="https://…" />
                <button onClick={() => set("socials", s.socials.filter((_, j) => j !== i))} className="grid w-11 shrink-0 place-items-center rounded-2xl text-red-300 hover:bg-red-500/15" aria-label="Retirer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={() => set("socials", [...s.socials, { label: "", url: "" }])} className="btn btn-glass !py-2 text-sm">
              <Plus size={15} /> Ajouter un lien
            </button>
          </section>
        </div>

        <section className="glass space-y-4 rounded-[2rem] p-6">
          <h2 className="font-semibold">À propos</h2>
          <FieldInput
            field={{ name: "about", label: "Paragraphes (une ligne vide entre chaque)", type: "textarea" }}
            value={s.about.join("\n\n")}
            onChange={(v) => set("about", String(v).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean))}
            upload={upload}
          />
          <FieldInput field={{ name: "interests", label: "Centres d'intérêt", type: "tags" }} value={s.interests} onChange={(v) => set("interests", v as string[])} upload={upload} />
          <div>
            <span className="mb-1.5 block text-sm text-ultra-200/80">Langues</span>
            {s.languages.map((l, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input value={l.name} onChange={(e) => set("languages", s.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="field" placeholder="Anglais" />
                <input value={l.level} onChange={(e) => set("languages", s.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))} className="field" placeholder="Niveau" />
                <button onClick={() => set("languages", s.languages.filter((_, j) => j !== i))} className="grid w-11 shrink-0 place-items-center rounded-2xl text-red-300 hover:bg-red-500/15" aria-label="Retirer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={() => set("languages", [...s.languages, { name: "", level: "" }])} className="btn btn-glass !py-2 text-sm">
              <Plus size={15} /> Ajouter une langue
            </button>
          </div>
        </section>

        <div className="space-y-5">
          <section className="glass space-y-4 rounded-[2rem] p-6">
            <h2 className="font-semibold">Chiffres clés (accueil)</h2>
            {s.highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input value={h.value} onChange={(e) => set("highlights", s.highlights.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className="field !w-28" placeholder="2ᵉ" />
                <input value={h.label} onChange={(e) => set("highlights", s.highlights.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="field" placeholder="Description" />
                <button onClick={() => set("highlights", s.highlights.filter((_, j) => j !== i))} className="grid w-11 shrink-0 place-items-center rounded-2xl text-red-300 hover:bg-red-500/15" aria-label="Retirer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {s.highlights.length < 3 && (
              <button onClick={() => set("highlights", [...s.highlights, { value: "", label: "" }])} className="btn btn-glass !py-2 text-sm">
                <Plus size={15} /> Ajouter un chiffre
              </button>
            )}
          </section>

          <form onSubmit={changePassword} className="glass space-y-4 rounded-[2rem] p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <KeyRound size={17} /> Mot de passe du dashboard
            </h2>
            <input name="pw" type="password" autoComplete="new-password" placeholder="Nouveau mot de passe (10 caractères min.)" className="field" />
            <button className="btn btn-glass !py-2 text-sm">Changer le mot de passe</button>
          </form>
        </div>
      </div>
    </>
  );
}
