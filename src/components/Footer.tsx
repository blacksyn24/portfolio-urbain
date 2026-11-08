import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-28">
      <div className="glass flex flex-col items-center justify-between gap-3 rounded-full px-6 py-4 text-sm text-ultra-200/70 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
        </span>
        <span className="font-mono text-xs">{profile.location} · 🇧🇯</span>
      </div>
    </footer>
  );
}
