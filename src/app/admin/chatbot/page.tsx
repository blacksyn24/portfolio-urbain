"use client";

import { Bot, Loader2, Save, Trash2, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { IconBtn } from "@/components/admin/Crud";
import { PageHeader } from "@/components/admin/Shell";
import { useIsland } from "@/components/IslandProvider";

type Conv = { id: string; created_at: string; chat_messages: { role: string; content: string; created_at: string }[] };

export default function ChatbotAdmin() {
  const { db, publish } = useAdmin();
  const { notify } = useIsland();
  const [enabled, setEnabled] = useState(true);
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [convs, setConvs] = useState<Conv[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [s, c] = await Promise.all([
      db.from("settings").select("chatbot_enabled,chatbot_instructions").eq("id", 1).single(),
      db.from("chat_conversations").select("id,created_at,chat_messages(role,content,created_at)").order("created_at", { ascending: false }).limit(100),
    ]);
    if (s.data) {
      setEnabled(s.data.chatbot_enabled);
      setInstructions(s.data.chatbot_instructions);
    }
    const list = ((c.data as Conv[]) ?? []).map((x) => ({ ...x, chat_messages: [...x.chat_messages].sort((a, b) => a.created_at.localeCompare(b.created_at)) }));
    setConvs(list);
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    const { error } = await db.from("settings").update({ chatbot_enabled: enabled, chatbot_instructions: instructions, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    if (error) return notify({ title: "Enregistrement impossible", subtitle: error.message, tone: "error" });
    await publish();
    notify({ title: "Chatbot mis à jour", tone: "success" });
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette conversation ?")) return;
    await db.from("chat_conversations").delete().eq("id", id);
    load();
  }

  return (
    <>
      <PageHeader title="Chatbot" intro="Le chatbot répond à partir du contenu de votre site (profil, compétences, projets, parcours) et de vos consignes." />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <section className="glass h-fit space-y-4 rounded-[2rem] p-6">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <span className="text-sm">Afficher le chatbot sur le site</span>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-5 w-5 accent-[#2e5de6]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-ultra-200/80">Consignes supplémentaires</span>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={9} className="field resize-y" placeholder="Ex. : Je suis disponible pour un stage à partir de janvier 2027. Mes tarifs freelance sont sur demande." />
            <span className="mt-1 block text-xs text-ultra-200/50">Ajoutez ici ce que le chatbot doit savoir en plus : disponibilités, type de poste recherché, ton à adopter…</span>
          </label>
          <button onClick={save} disabled={saving} className="btn btn-primary disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Enregistrer
          </button>
        </section>

        <section className="glass rounded-[2rem] p-6">
          <h2 className="mb-4 font-semibold">Conversations récentes</h2>
          {!convs ? (
            <Loader2 className="animate-spin text-ultra-300" />
          ) : convs.length === 0 ? (
            <p className="text-sm text-ultra-200/55">Aucune conversation pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {convs.map((c) => (
                <li key={c.id} className="rounded-2xl bg-white/5">
                  <div className="flex items-center gap-3 p-3 pl-4">
                    <button onClick={() => setOpen(open === c.id ? null : c.id)} className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-medium">{c.chat_messages.find((m) => m.role === "user")?.content ?? "(vide)"}</span>
                      <span className="text-xs text-ultra-200/55">
                        {new Date(c.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {Math.ceil(c.chat_messages.length / 2)} question(s)
                      </span>
                    </button>
                    <IconBtn label="Supprimer" danger onClick={() => remove(c.id)}>
                      <Trash2 size={15} />
                    </IconBtn>
                  </div>
                  {open === c.id && (
                    <div className="space-y-2 border-t border-white/8 p-4">
                      {c.chat_messages.map((m, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          {m.role === "user" ? <User size={15} className="mt-0.5 shrink-0 text-ultra-300" /> : <Bot size={15} className="mt-0.5 shrink-0 text-ok" />}
                          <p className="whitespace-pre-wrap text-ultra-50/90">{m.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
