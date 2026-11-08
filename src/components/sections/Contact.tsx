"use client";

import { Clock3, Code2, Loader2, Mail, MapPin, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { track } from "@/lib/track";
import type { Settings } from "@/lib/types";
import { useIsland } from "../IslandProvider";
import { Reveal } from "../Reveal";

type Errors = Partial<Record<"name" | "email" | "subject" | "message" | "consent", string>>;

const GRADIENT = "linear-gradient(90deg, #7b5cf5, #2e5de6 50%, #6e92f2)";
const MIN_MESSAGE = 10;

/**
 * Page de contact : grande carte en verre, formulaire à champs soulignés à gauche,
 * informations à droite. Mise en page inspirée d'un modèle choisi par Urbain, aux couleurs du site.
 */
export function Contact({ settings: profile }: { settings: Settings; headless?: boolean }) {
  const { notify } = useIsland();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [length, setLength] = useState(0);
  const github = profile.socials.find((s) => /github/i.test(s.url));
  const others = profile.socials.filter((s) => s !== github);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!fd.get("consent")) {
      setErrors({ consent: "Merci d'accepter pour que je puisse vous répondre." });
      return;
    }
    fd.delete("consent");
    const data = Object.fromEntries(fd);
    setSending(true);
    setErrors({});
    notify({ title: "Envoi en cours…", subtitle: "Un instant", tone: "typing", duration: 0 });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        notify({ title: "Message non envoyé", subtitle: json.message ?? "Vérifiez le formulaire", tone: "error" });
        return;
      }
      form.reset();
      setLength(0);
      notify({ title: "Message envoyé", subtitle: "Je vous réponds rapidement 🙌", tone: "success" });
    } catch {
      notify({ title: "Connexion impossible", subtitle: "Réessayez dans un instant", tone: "error" });
    } finally {
      setSending(false);
    }
  }

  const progress = Math.min(1, length / 120);

  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-4 pb-6 pt-28 sm:pt-32">
      {/* Formes lumineuses décoratives derrière la carte */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-24 top-24 h-[420px] w-[420px] rounded-full border-[46px] border-violet-glow/55 blur-[18px] sm:-right-10" />
        <div className="absolute -left-28 bottom-0 h-[340px] w-[340px] rounded-full border-[40px] border-ultra-500/60 blur-[20px]" />
        <div className="absolute left-1/2 top-16 h-16 w-16 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-glow to-ultra-500 blur-[2px]" />
      </div>

      <Reveal className="glass relative grid gap-10 rounded-[2.5rem] p-7 sm:p-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Formulaire */}
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Travaillons
            <br />
            ensemble
          </h1>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            <span className="h-1 w-14 rounded-full bg-violet-glow" />
            <span className="h-1 w-10 rounded-full bg-ultra-300" />
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-9 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Line name="name" label="Nom complet" autoComplete="name" error={errors.name} />
              <Line name="email" label="Email" type="email" autoComplete="email" error={errors.email} />
            </div>
            <Line name="subject" label="Sujet" error={errors.subject} placeholder="Stage, projet réseau, question…" />
            <label className="block">
              <span className="block text-sm text-ultra-200/80">Message</span>
              <textarea
                name="message"
                rows={4}
                maxLength={5000}
                onChange={(e) => setLength(e.target.value.trim().length)}
                placeholder="Bonjour Urbain, …"
                className="mt-1 w-full resize-none border-b border-white/25 bg-transparent py-2 text-white outline-none transition-colors placeholder:text-ultra-200/35 focus:border-ultra-300"
              />
              {errors.message && <span className="mt-1 block text-xs text-red-300">{errors.message}</span>}
            </label>

            {/* Barre de progression du message (comme la jauge du modèle) */}
            <div className="flex items-center gap-3" aria-hidden>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${progress * 100}%`, background: GRADIENT }} />
              </div>
              <span className="text-xs text-ultra-200/60">{length < MIN_MESSAGE ? `${MIN_MESSAGE - length} caractères min.` : "Message prêt ✓"}</span>
            </div>

            {/* Autres moyens de contact */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-ultra-200/70">
              <span>ou écris-moi via</span>
              <a href={`mailto:${profile.email}`} onClick={() => track("contact_click", "email")} aria-label="Email" title={profile.email} className="text-ultra-200 transition-colors hover:text-white">
                <Mail size={19} />
              </a>
              {github && (
                <a href={github.url} target="_blank" rel="noopener" onClick={() => track("social_click", "github")} aria-label="GitHub" title="GitHub" className="text-ultra-200 transition-colors hover:text-white">
                  <Code2 size={19} />
                </a>
              )}
              {others.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener" onClick={() => track("social_click", s.label)} className="text-xs font-medium text-ultra-200 hover:text-white">
                  {s.label}
                </a>
              ))}
            </div>

            {/* piège anti-spam : invisible pour les humains */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <button
              type="submit"
              disabled={sending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white shadow-[0_14px_34px_-10px_rgb(123_92_245/.8),inset_0_1px_0_rgb(255_255_255/.35)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
              style={{ background: GRADIENT }}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Envoyer le message
            </button>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ultra-200/80">
              <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-[#2e5de6]" onChange={() => setErrors((e) => ({ ...e, consent: undefined }))} />
              <span>J&apos;accepte que mes informations soient utilisées uniquement pour me répondre.</span>
            </label>
            {errors.consent && <p className="-mt-3 text-xs text-red-300">{errors.consent}</p>}
          </form>
        </div>

        {/* Informations */}
        <div className="flex flex-col gap-6 lg:border-l lg:border-white/10 lg:pl-12">
          <div className="glass glass-dark flex w-max max-w-full items-center gap-4 self-start rounded-full py-2 pl-5 pr-2 lg:self-end">
            <span className="text-sm font-semibold text-white">Réponse sous 48 h</span>
            <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: GRADIENT }}>
              <Clock3 size={18} className="text-white" />
            </span>
          </div>

          <figure className="rounded-[1.6rem] border border-white/12 bg-white/[0.04] p-6">
            <blockquote className="leading-relaxed text-ultra-50/90">
              « {profile.availability}. Stage, projet réseau ou simple échange technique : écrivez-moi, je lis chaque message avec attention. »
            </blockquote>
            <figcaption className="mt-4 text-sm text-ultra-200/70">
              / {profile.first_name.split(" ")[0]}, {profile.title.toLowerCase()}
            </figcaption>
          </figure>

          <ul className="space-y-3 text-sm">
            <li>
              <a href={`mailto:${profile.email}`} onClick={() => track("contact_click", "email")} className="flex items-center gap-3 text-ultra-50 hover:text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8">
                  <Mail size={16} />
                </span>
                {profile.email}
              </a>
            </li>
            <li className="flex items-center gap-3 text-ultra-50">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8">
                <MapPin size={16} />
              </span>
              {profile.location} 🇧🇯
            </li>
          </ul>

          <div className="glass glass-dark mt-auto flex w-max max-w-full items-center gap-2.5 self-start rounded-full py-2 pl-2 pr-5 lg:self-end">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
              <ShieldCheck size={16} className="text-ok" />
            </span>
            <span className="text-sm font-medium text-ultra-50">Envoi sécurisé & chiffré</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Line({ name, label, type = "text", error, autoComplete, placeholder }: { name: string; label: string; type?: string; error?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-sm text-ultra-200/80">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-1 w-full border-b border-white/25 bg-transparent py-2 text-white outline-none transition-colors placeholder:text-ultra-200/35 focus:border-ultra-300"
      />
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}
