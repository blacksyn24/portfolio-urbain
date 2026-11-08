"use client";

import { ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { DailyBars, perDay, StatTile } from "@/components/admin/charts";
import { PageHeader } from "@/components/admin/Shell";

type Recent = { id: string; name: string; subject: string; status: string; created_at: string };

export default function Overview() {
  const { db, session, unread } = useAdmin();
  const [d, setD] = useState<null | {
    views: string[];
    visitors: number;
    cv: number;
    convs: number;
    messages: number;
    recent: Recent[];
    counts: { projects: number; certs: number };
  }>(null);

  useEffect(() => {
    const since = new Date(Date.now() - 14 * 86400_000).toISOString();
    Promise.all([
      db.from("page_views").select("created_at,session_id").gte("created_at", since).limit(20000),
      db.from("events").select("id", { count: "exact", head: true }).eq("type", "cv_download").gte("created_at", since),
      db.from("chat_conversations").select("id", { count: "exact", head: true }).gte("created_at", since),
      db.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since),
      db.from("messages").select("id,name,subject,status,created_at").neq("status", "archived").order("created_at", { ascending: false }).limit(5),
      db.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
      db.from("certifications").select("id", { count: "exact", head: true }).eq("published", true),
    ]).then(([v, cv, conv, msg, recent, p, c]) => {
      const views = (v.data as { created_at: string; session_id: string }[]) ?? [];
      setD({
        views: views.map((x) => x.created_at),
        visitors: new Set(views.map((x) => x.session_id).filter(Boolean)).size,
        cv: cv.count ?? 0,
        convs: conv.count ?? 0,
        messages: msg.count ?? 0,
        recent: (recent.data as Recent[]) ?? [],
        counts: { projects: p.count ?? 0, certs: c.count ?? 0 },
      });
    });
  }, [db]);

  const hour = new Date().getHours();
  const hello = hour < 18 ? "Bonjour" : "Bonsoir";

  return (
    <>
      <PageHeader title={`${hello} Urbain 👋`} intro={`Les 14 derniers jours sur votre portfolio · ${session.user.email}`} />
      {!d ? (
        <Loader2 className="animate-spin text-ultra-300" />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Visiteurs" value={d.visitors} hint={`${d.views.length} pages vues`} />
            <StatTile label="Messages reçus" value={d.messages} hint={unread ? `${unread} non lu${unread > 1 ? "s" : ""}` : "tout est lu"} />
            <StatTile label="Conversations chatbot" value={d.convs} />
            <StatTile label="CV téléchargé" value={d.cv} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <section className="glass rounded-[2rem] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Pages vues par jour</h2>
                <Link href="/admin/statistiques" className="flex items-center gap-1 text-sm text-ultra-300 hover:text-white">
                  Détails <ArrowRight size={14} />
                </Link>
              </div>
              <DailyBars data={perDay(d.views, 14)} unit="pages vues" />
            </section>
            <section className="glass rounded-[2rem] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Derniers messages</h2>
                <Link href="/admin/messages" className="flex items-center gap-1 text-sm text-ultra-300 hover:text-white">
                  Tout voir <ArrowRight size={14} />
                </Link>
              </div>
              {d.recent.length === 0 ? (
                <p className="text-sm text-ultra-200/55">Aucun message pour le moment.</p>
              ) : (
                <ul className="space-y-2">
                  {d.recent.map((m) => (
                    <li key={m.id}>
                      <Link href="/admin/messages" className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 hover:bg-white/10">
                        <Mail size={15} className={m.status === "new" ? "text-ultra-300" : "text-ultra-200/40"} />
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm ${m.status === "new" ? "font-semibold text-white" : ""}`}>{m.name}</span>
                          <span className="block truncate text-xs text-ultra-200/60">{m.subject}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/admin/projets", label: "Projets publiés", value: d.counts.projects },
              { href: "/admin/certifications", label: "Certifications", value: d.counts.certs },
              { href: "/admin/parametres", label: "Profil, photo & CV", value: "Modifier" },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="glass flex items-center justify-between rounded-[1.75rem] p-5 transition-transform hover:-translate-y-0.5">
                <span>
                  <span className="block text-sm text-ultra-200/70">{q.label}</span>
                  <span className="text-xl font-semibold">{q.value}</span>
                </span>
                <ArrowRight size={18} className="text-ultra-300" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
