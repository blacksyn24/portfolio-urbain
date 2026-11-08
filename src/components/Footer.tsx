import Link from "next/link";
import { navItems } from "@/content/profile";
import type { Settings } from "@/lib/types";

export function Footer({ settings: profile }: { settings: Settings }) {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-28">
      <div className="glass flex flex-col gap-6 rounded-[2rem] px-6 py-6 text-sm text-ultra-200/70 md:flex-row md:items-center md:justify-between md:rounded-full md:py-4">
        <span>
          © {new Date().getFullYear()} {profile.first_name} {profile.last_name}
        </span>
        <nav aria-label="Pied de page" className="flex flex-wrap gap-x-4 gap-y-2">
          {navItems.slice(1).map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <span className="flex items-center gap-4">
          {profile.socials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener" className="hover:text-white">
              {s.label}
            </a>
          ))}
          <span className="font-mono text-xs">{profile.location} · 🇧🇯</span>
        </span>
      </div>
    </footer>
  );
}
