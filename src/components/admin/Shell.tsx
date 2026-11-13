"use client";

import { Award, BarChart3, Bell, Bot, Clock, Cpu, ExternalLink, FileDown, FolderGit2, LayoutDashboard, LogOut, Mail, PenLine, Plus, Search, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "./AdminProvider";
import { NoticeIsland } from "./NoticeIsland";

const nav = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/messages", label: "Messages", icon: Mail, badge: true },
  { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/projets", label: "Projets", icon: FolderGit2 },
  { href: "/admin/competences", label: "Compétences", icon: Cpu },
  { href: "/admin/parcours", label: "Parcours", icon: Clock },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/blog", label: "Blog", icon: PenLine },
  { href: "/admin/ressources", label: "Ressources", icon: FileDown },
  { href: "/admin/chatbot", label: "Chatbot", icon: Bot },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

/** Ce que le bouton « + » permet d'ajouter directement. */
const quickAdd = [
  { href: "/admin/projets?nouveau=1", label: "Un projet ou un lab", icon: FolderGit2 },
  { href: "/admin/blog?nouveau=1", label: "Un article de blog", icon: PenLine },
  { href: "/admin/ressources?nouveau=1", label: "Une ressource (PDF…)", icon: FileDown },
  { href: "/admin/certifications?nouveau=1", label: "Une certification", icon: Award },
  { href: "/admin/parcours?nouveau=1", label: "Une étape du parcours", icon: Clock },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { db, unread, session } = useAdmin();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [plus, setPlus] = useState(false);
  const [photo, setPhoto] = useState("");
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    db.from("settings").select("photo_url").eq("id", 1).single().then(({ data }) => setPhoto((data as { photo_url?: string } | null)?.photo_url ?? ""));
  }, [db]);
  useEffect(() => setPlus(false), [path]);
  // Raccourci « / » : aller à la recherche
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matches = q.trim() ? nav.filter((n) => norm(n.label).includes(norm(q.trim()))) : nav;
  const go = (href: string) => {
    setQ("");
    setFocus(false);
    search.current?.blur();
    router.push(href);
  };
  const hour = new Date().getHours();

  return (
    <div className="mx-auto min-h-dvh max-w-[1500px] px-3 pb-28 pt-3 sm:px-5 sm:pt-5">
      <NoticeIsland />

      {/* Barre du haut : bienvenue, recherche, alertes */}
      <header className="glass glass-liquid sticky top-3 z-40 flex items-center gap-3 rounded-full p-2 pr-3 sm:top-5">
        <Link href="/admin" className="flex shrink-0 items-center gap-3 rounded-full pr-2">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/25" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ultra-500 font-semibold">U</span>
          )}
          <span className="hidden font-semibold sm:block">{hour < 18 ? "Bonjour" : "Bonsoir"}, Urbain</span>
        </Link>

        <div className="relative min-w-0 flex-1">
          <label className="flex items-center gap-2.5 rounded-full bg-white/8 px-4 py-2.5 ring-1 ring-white/10 focus-within:ring-ultra-300">
            <Search size={16} className="shrink-0 text-ultra-200/60" />
            <input
              ref={search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) go(matches[0].href);
                if (e.key === "Escape") (setQ(""), search.current?.blur());
              }}
              placeholder="Aller à… (projets, messages, blog)"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-ultra-200/50"
              aria-label="Rechercher une rubrique"
            />
            <kbd className="hidden rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.65rem] text-ultra-200/70 sm:block">/</kbd>
          </label>
          {focus && (
            <ul className="glass glass-dark absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-3xl p-2">
              {matches.length === 0 && <li className="px-3 py-2 text-sm text-ultra-200/60">Aucune rubrique ne correspond.</li>}
              {matches.map((n) => (
                <li key={n.href}>
                  <button type="button" onMouseDown={(e) => (e.preventDefault(), go(n.href))} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-ultra-100 hover:bg-white/10 hover:text-white">
                    <n.icon size={16} /> {n.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/admin/messages" title={unread ? `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}` : "Messages"} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/10">
          <Bell size={18} />
          {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ultra-500 px-1 text-[0.65rem] font-bold">{unread}</span>}
        </Link>
        <a href="/" target="_blank" title="Voir le site" className="hidden h-10 shrink-0 items-center gap-2 rounded-full bg-white/8 px-4 text-sm ring-1 ring-white/10 hover:bg-white/15 md:flex">
          <ExternalLink size={15} /> Voir le site
        </a>
        <button onClick={() => db.auth.signOut()} title={`Déconnexion (${session.user.email})`} aria-label="Déconnexion" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ultra-200 hover:bg-white/10 hover:text-white">
          <LogOut size={17} />
        </button>
      </header>

      <div className="mt-5 flex gap-5">
        {/* Rail d'icônes à gauche */}
        <aside className="sticky top-24 z-30 hidden h-fit shrink-0 lg:block">
          <nav className="glass glass-liquid flex flex-col gap-1 rounded-full p-2">
            {nav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-label={n.label}
                  className={`group relative grid h-11 w-11 place-items-center rounded-full transition-colors ${active ? "bg-white text-ink-950 shadow-[0_8px_24px_-6px_rgb(255_255_255/.55)]" : "text-ultra-50 hover:bg-white/18 hover:text-white"}`}
                >
                  <n.icon size={18} strokeWidth={1.9} />
                  {n.badge && unread > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-ultra-300 ring-2 ring-ink-950" />}
                  <span className="pointer-events-none absolute left-full z-50 ml-3 -translate-x-1 whitespace-nowrap rounded-full bg-ink-950/85 px-3.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-[0_10px_30px_-8px_rgb(0_0_0/.7),inset_0_1px_0_rgb(255_255_255/.35)] ring-1 ring-white/25 backdrop-blur-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                    {n.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Onglets en pilule en bas, avec le bouton « + » */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
        <div className="pointer-events-auto relative flex max-w-full items-center gap-2">
          <nav className="glass glass-liquid flex min-w-0 gap-1 overflow-x-auto rounded-full p-1.5 [scrollbar-width:none]">
            {nav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link key={n.href} href={n.href} className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-colors ${active ? "bg-white font-semibold text-ink-950" : "text-ultra-200 hover:bg-white/10 hover:text-white"} ${active ? "" : "lg:hidden xl:flex"}`}>
                  <n.icon size={15} className="lg:hidden" />
                  {n.label}
                  {n.badge && unread > 0 && <span className="rounded-full bg-ultra-500 px-1.5 text-xs font-semibold text-white">{unread}</span>}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => setPlus((v) => !v)} aria-label="Ajouter" title="Ajouter" className={`grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-xl transition-transform ${plus ? "rotate-45 bg-white text-ink-950" : "bg-ultra-500 text-white hover:-translate-y-0.5"}`}>
            {plus ? <X size={20} className="-rotate-45" /> : <Plus size={22} />}
          </button>
          {plus && (
            <ul className="glass glass-dark absolute bottom-full right-0 mb-3 w-64 rounded-3xl p-2">
              <li className="px-3 pb-1 pt-2 font-mono text-[0.68rem] uppercase tracking-widest text-ultra-300">Ajouter</li>
              {quickAdd.map((a2) => (
                <li key={a2.href}>
                  {/* Lien classique : la page se recharge et ouvre directement le formulaire d'ajout */}
                  <a href={a2.href} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-ultra-100 hover:bg-white/10 hover:text-white">
                    <a2.icon size={16} /> {a2.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, intro, action }: { title: string; intro?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 pt-2">
      <div>
        <h1 className="text-gradient text-3xl font-semibold tracking-tight">{title}</h1>
        {intro && <p className="mt-1 text-sm text-ultra-200/70">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
