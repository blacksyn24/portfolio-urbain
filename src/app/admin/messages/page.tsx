"use client";

import { Archive, ArchiveRestore, Loader2, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { IconBtn } from "@/components/admin/Crud";
import { PageHeader } from "@/components/admin/Shell";
import { useIsland } from "@/components/IslandProvider";

type Message = { id: string; name: string; email: string; subject: string; message: string; status: "new" | "read" | "archived"; created_at: string };
const tabs = [
  { id: "inbox", label: "Boîte de réception" },
  { id: "archived", label: "Archivés" },
] as const;

export default function MessagesPage() {
  const { db, refreshUnread } = useAdmin();
  const { notify } = useIsland();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("inbox");
  const [items, setItems] = useState<Message[] | null>(null);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = useCallback(async () => {
    const q = db.from("messages").select("*").order("created_at", { ascending: false }).limit(500);
    const { data } = await (tab === "inbox" ? q.neq("status", "archived") : q.eq("status", "archived"));
    setItems((data as Message[]) ?? []);
    refreshUnread();
  }, [db, tab, refreshUnread]);

  useEffect(() => {
    load();
    const ch = db
      .channel("messages-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => {
      db.removeChannel(ch);
    };
  }, [db, load]);

  async function setStatus(m: Message, status: Message["status"]) {
    await db.from("messages").update({ status }).eq("id", m.id);
    if (selected?.id === m.id) setSelected({ ...m, status });
    if (status === "archived") notify({ title: "Message archivé", tone: "success" });
    load();
  }

  async function open(m: Message) {
    setSelected(m);
    if (m.status === "new") await setStatus(m, "read");
  }

  async function remove(m: Message) {
    if (!confirm(`Supprimer définitivement le message de ${m.name} ?`)) return;
    await db.from("messages").delete().eq("id", m.id);
    setSelected(null);
    notify({ title: "Message supprimé", tone: "success" });
    load();
  }

  return (
    <>
      <PageHeader
        title="Messages"
        intro="Messages reçus via le formulaire de contact."
        action={
          <div className="glass flex rounded-full p-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }} className={`rounded-full px-4 py-1.5 text-sm ${tab === t.id ? "bg-white/15 text-white" : "text-ultra-200/75 hover:text-white"}`}>
                {t.label}
              </button>
            ))}
          </div>
        }
      />
      {!items ? (
        <Loader2 className="animate-spin text-ultra-300" />
      ) : items.length === 0 ? (
        <div className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">Aucun message ici.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <ul className="space-y-2">
            {items.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => open(m)}
                  className={`glass w-full rounded-[1.4rem] p-4 text-left transition-colors ${selected?.id === m.id ? "glass-strong" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {m.status === "new" ? <Mail size={15} className="text-ultra-300" /> : <MailOpen size={15} className="text-ultra-200/50" />}
                    <span className={`flex-1 truncate ${m.status === "new" ? "font-semibold text-white" : ""}`}>{m.name}</span>
                    <span className="shrink-0 text-xs text-ultra-200/55">{fmt(m.created_at)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm">{m.subject}</p>
                  <p className="truncate text-sm text-ultra-200/55">{m.message}</p>
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <article className="glass h-fit rounded-[2rem] p-6 lg:sticky lg:top-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{selected.subject}</h2>
                  <p className="text-sm text-ultra-200/75">
                    {selected.name} · <a href={`mailto:${selected.email}`} className="underline">{selected.email}</a>
                  </p>
                  <p className="text-xs text-ultra-200/50">{new Date(selected.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex">
                  <IconBtn label="Marquer non lu" onClick={() => setStatus(selected, "new")}>
                    <Mail size={16} />
                  </IconBtn>
                  {selected.status === "archived" ? (
                    <IconBtn label="Désarchiver" onClick={() => setStatus(selected, "read")}>
                      <ArchiveRestore size={16} />
                    </IconBtn>
                  ) : (
                    <IconBtn label="Archiver" onClick={() => setStatus(selected, "archived")}>
                      <Archive size={16} />
                    </IconBtn>
                  )}
                  <IconBtn label="Supprimer" danger onClick={() => remove(selected)}>
                    <Trash2 size={16} />
                  </IconBtn>
                </div>
              </div>
              <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ultra-50/90">{selected.message}</p>
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + selected.subject)}&body=${encodeURIComponent(`\n\n— Message d'origine —\n${selected.message}`)}`}
                className="btn btn-primary mt-6"
              >
                <Reply size={17} /> Répondre par email
              </a>
            </article>
          ) : (
            <div className="glass hidden h-fit rounded-[2rem] p-10 text-center text-ultra-200/60 lg:block">Sélectionnez un message.</div>
          )}
        </div>
      )}
    </>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
