"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { countBy, DailyBars, perDay, RankList, StatTile } from "@/components/admin/charts";
import { PageHeader } from "@/components/admin/Shell";

type View = { created_at: string; path: string; referrer: string; device: string; session_id: string };
type Ev = { created_at: string; type: string; label: string };

const ranges = [7, 30, 90] as const;
const eventLabel: Record<string, string> = {
  cv_download: "Téléchargements du CV",
  project_click: "Clics sur les projets",
  contact_click: "Clics sur l'email",
  chat_open: "Ouvertures du chatbot",
  social_click: "Clics réseaux sociaux",
  document_download: "Documents téléchargés",
  credential_click: "Certificats & badges consultés",
};

export default function StatsPage() {
  const { db } = useAdmin();
  const [days, setDays] = useState<(typeof ranges)[number]>(30);
  const [views, setViews] = useState<View[] | null>(null);
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    setViews(null);
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    Promise.all([
      db.from("page_views").select("created_at,path,referrer,device,session_id").gte("created_at", since).order("created_at").limit(20000),
      db.from("events").select("created_at,type,label").gte("created_at", since).limit(20000),
    ]).then(([v, e]) => {
      setViews((v.data as View[]) ?? []);
      setEvents((e.data as Ev[]) ?? []);
    });
  }, [db, days]);

  const visitors = views ? new Set(views.map((v) => v.session_id).filter(Boolean)).size : 0;

  return (
    <>
      <PageHeader
        title="Statistiques"
        intro="Visites et interactions sur votre portfolio (robots exclus)."
        action={
          <div className="glass flex rounded-full p-1">
            {ranges.map((r) => (
              <button key={r} onClick={() => setDays(r)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${days === r ? "bg-white/15 text-white" : "text-ultra-200/75 hover:text-white"}`}>
                {r} jours
              </button>
            ))}
          </div>
        }
      />
      {!views ? (
        <Loader2 className="animate-spin text-ultra-300" />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Pages vues" value={views.length} />
            <StatTile label="Visiteurs" value={visitors} hint="sessions distinctes" />
            <StatTile label="CV téléchargé" value={events.filter((e) => e.type === "cv_download").length} />
            <StatTile label="Chatbot ouvert" value={events.filter((e) => e.type === "chat_open").length} />
          </div>
          <section className="glass rounded-[2rem] p-5 sm:p-6">
            <h2 className="mb-4 font-semibold">Pages vues par jour</h2>
            <DailyBars data={perDay(views.map((v) => v.created_at), days)} unit="pages vues" />
          </section>
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="glass rounded-[2rem] p-6">
              <h2 className="mb-4 font-semibold">Sites d&apos;origine</h2>
              <RankList rows={countBy(views, (v) => v.referrer || "Accès direct")} />
            </section>
            <section className="glass rounded-[2rem] p-6">
              <h2 className="mb-4 font-semibold">Appareils</h2>
              <RankList rows={countBy(views, (v) => v.device)} />
            </section>
            <section className="glass rounded-[2rem] p-6">
              <h2 className="mb-4 font-semibold">Interactions</h2>
              <RankList rows={countBy(events, (e) => eventLabel[e.type] ?? e.type)} empty="Aucune interaction sur la période." />
            </section>
          </div>
          <section className="glass rounded-[2rem] p-6">
            <h2 className="mb-4 font-semibold">Pages les plus vues</h2>
            <RankList rows={countBy(views, (v) => v.path, 8)} />
          </section>
          <section className="glass rounded-[2rem] p-6">
            <h2 className="mb-4 font-semibold">Documents les plus téléchargés</h2>
            <RankList rows={countBy(events.filter((e) => e.type === "document_download"), (e) => e.label, 8)} empty="Aucun téléchargement sur la période." />
          </section>
          <section className="glass rounded-[2rem] p-6">
            <h2 className="mb-4 font-semibold">Projets les plus consultés</h2>
            <RankList rows={countBy(events.filter((e) => e.type === "project_click"), (e) => e.label.split(":")[0], 8)} empty="Ajoutez des liens de démo ou de code à vos projets pour suivre les clics." />
          </section>
        </div>
      )}
    </>
  );
}
