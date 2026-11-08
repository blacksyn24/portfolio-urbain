"use client";

import { Award, BarChart3, Bot, Clock, Cpu, ExternalLink, FolderGit2, LayoutDashboard, LogOut, Mail, Menu, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  { href: "/admin/chatbot", label: "Chatbot", icon: Bot },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { db, unread, session } = useAdmin();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-colors ${
              active ? "bg-white/12 font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/.2)]" : "text-ultra-200/80 hover:bg-white/6 hover:text-white"
            }`}
          >
            <n.icon size={18} strokeWidth={1.8} />
            <span className="flex-1">{n.label}</span>
            {n.badge && unread > 0 && <span className="rounded-full bg-ultra-500 px-2 py-0.5 text-xs font-semibold text-white">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-auto space-y-1 border-t border-white/8 pt-4">
      <a href="/" target="_blank" className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm text-ultra-200/80 hover:bg-white/6 hover:text-white">
        <ExternalLink size={18} /> Voir le site
      </a>
      <button onClick={() => db.auth.signOut()} className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm text-ultra-200/80 hover:bg-white/6 hover:text-white">
        <LogOut size={18} /> Déconnexion
      </button>
      <p className="truncate px-3.5 pt-2 text-xs text-ultra-200/50">{session.user.email}</p>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px] gap-5 p-3 sm:p-5">
      <NoticeIsland />
      <aside className="glass glass-dark sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-64 shrink-0 flex-col gap-6 rounded-[2rem] p-4 lg:flex">
        <p className="px-3 pt-2 font-mono text-xs uppercase tracking-[0.14em] text-ultra-300">// dashboard</p>
        {links}
        {footer}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="glass glass-dark mb-4 flex items-center justify-between rounded-full px-4 py-2.5 lg:hidden">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-ultra-300">// dashboard</span>
          <button onClick={() => setOpen(true)} aria-label="Menu" className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-white/10">
            <Menu size={18} />
            {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-ultra-300" />}
          </button>
        </div>
        {open && (
          <div className="fixed inset-0 z-50 bg-ink-950/60 p-3 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)}>
            <div className="glass glass-dark flex h-full max-w-xs flex-col gap-4 rounded-[2rem] p-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setOpen(false)} className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer">
                <X size={18} />
              </button>
              {links}
              {footer}
            </div>
          </div>
        )}
        <main className="pb-10">{children}</main>
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
