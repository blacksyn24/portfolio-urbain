import type { Settings } from "@/lib/types";

export function Footer({ settings: profile }: { settings: Settings }) {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-28">
      <div className="glass flex flex-col items-center justify-between gap-3 rounded-full px-6 py-4 text-sm text-ultra-200/70 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.first_name} {profile.last_name}
        </span>
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
