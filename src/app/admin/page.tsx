"use client";

import { ArrowRight, Award, Bot, Clock, Cpu, Download, Eye, FileDown, FolderGit2, Heart, Loader2, Mail, PenLine, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { DailyBars, perDay } from "@/components/admin/charts";
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
    counts: { projects: number; certs: number; posts: number; docs: number; skills: number; steps: number; likes: number; hidden: number };
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
      db.from("posts").select("id", { count: "exact", head: true }),
      db.from("documents").select("id", { count: "exact", head: true }),
      db.from("skill_groups").select("items"),
      db.from("timeline").select("id", { count: "exact", head: true }),
      db.from("projects").select("likes,published"),
    ]).then(([v, cv, conv, msg, recent, p, c, po, dc, sk, tl, pl]) => {
      const views = (v.data as { created_at: string; session_id: string }[]) ?? [];
      setD({
        views: views.map((x) => x.created_at),
        visitors: new Set(views.map((x) => x.session_id).filter(Boolean)).size,
        cv: cv.count ?? 0,
        convs: conv.count ?? 0,
        messages: msg.count ?? 0,
        recent: (recent.data as Recent[]) ?? [],
        counts: {
          projects: p.count ?? 0,
          certs: c.count ?? 0,
          posts: po.count ?? 0,
          docs: dc.count ?? 0,
          skills: ((sk.data as { items: string[] }[]) ?? []).reduce((n, g) => n + (g.items?.length ?? 0), 0),
          steps: tl.count ?? 0,
          likes: ((pl.data as { likes: number | null }[]) ?? []).reduce((n, x) => n + (x.likes ?? 0), 0),
          hidden: ((pl.data as { published: boolean }[]) ?? []).filter((x) => !x.published).length,
        },
      });
    });
  }, [db]);

  const hour = new Date().getHours();
  const hello = hour < 18 ? "Bonjour" : "Bonsoir";

  return (
    <>
      <PageHeader title="Vue d'ensemble" intro={`${hello} Urbain 👋 Voici les 14 derniers jours sur ton portfolio.`} />
      {!d ? (
        <Loader2 className="animate-spin text-ultra-300" />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile icon={Users} label="Visiteurs" value={d.visitors} hint={`${d.views.length} pages vues`} href="/admin/statistiques" />
            <Tile icon={Mail} label="Messages reçus" value={d.messages} hint={unread ? `${unread} non lu${unread > 1 ? "s" : ""}` : "tout est lu"} href="/admin/messages" alert={unread > 0} />
            <Tile icon={Bot} label="Conversations chatbot" value={d.convs} href="/admin/chatbot" />
            <Tile icon={Download} label="CV téléchargé" value={d.cv} hint="sur 14 jours" href="/admin/parametres" />
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
          <div>
            <h2 className="mb-3 px-1 font-mono text-xs uppercase tracking-[0.14em] text-ultra-300">// contenu du site</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <Tile small icon={FolderGit2} label="Projets publiés" value={d.counts.projects} hint={d.counts.hidden ? `${d.counts.hidden} masqué${d.counts.hidden > 1 ? "s" : ""}` : undefined} href="/admin/projets" />
              <Tile small icon={Heart} label="J'aime reçus" value={d.counts.likes} href="/admin/projets" />
              <Tile small icon={Award} label="Certifications" value={d.counts.certs} href="/admin/certifications" />
              <Tile small icon={Cpu} label="Compétences" value={d.counts.skills} href="/admin/competences" />
              <Tile small icon={PenLine} label="Articles" value={d.counts.posts} href="/admin/blog" />
              <Tile small icon={FileDown} label="Ressources" value={d.counts.docs} href="/admin/ressources" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/admin/parcours", icon: Clock, label: "Parcours", value: `${d.counts.steps} étapes` },
              { href: "/admin/parametres", icon: Settings, label: "Profil, photo & CV", value: "Modifier" },
              { href: "/", icon: Eye, label: "Site public", value: "Ouvrir", external: true },
            ].map((q) => (
              <Link key={q.href} href={q.href} target={q.external ? "_blank" : undefined} className="glass flex items-center gap-4 rounded-[1.75rem] p-5 transition-transform hover:-translate-y-0.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ultra-500/50">
                  <q.icon size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ultra-200/70">{q.label}</span>
                  <span className="text-lg font-semibold">{q.value}</span>
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

/** Tuile en verre du tableau de bord : icône, chiffre, libellé, lien vers la rubrique. */
function Tile({ icon: Icon, label, value, hint, href, small, alert }: { icon: typeof Mail; label: string; value: string | number; hint?: string; href: string; small?: boolean; alert?: boolean }) {
  return (
    <Link href={href} className={`glass group relative block rounded-[1.75rem] transition-transform hover:-translate-y-0.5 ${small ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between">
        <span className={`grid place-items-center rounded-2xl bg-gradient-to-b from-ultra-500/70 to-ultra-700/60 shadow-[inset_0_1px_0_rgb(255_255_255/.3)] ${small ? "h-9 w-9" : "h-11 w-11"}`}>
          <Icon size={small ? 16 : 19} />
        </span>
        {alert ? <span className="h-2.5 w-2.5 rounded-full bg-ultra-300 shadow-[0_0_12px_rgb(110_146_242)]" /> : <ArrowRight size={16} className="text-ultra-200/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />}
      </div>
      <p className={`mt-3 font-semibold tabular-nums text-white ${small ? "text-2xl" : "text-4xl"}`}>{value}</p>
      <p className="mt-0.5 text-sm text-ultra-200/75">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-ultra-200/50">{hint}</p>}
    </Link>
  );
}
