"use client";

import { Loader2, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import type { Settings } from "@/lib/types";
import { track } from "@/lib/track";
import { useIsland } from "../IslandProvider";
import { Reveal } from "../Reveal";
import { SectionTitle } from "../SectionTitle";

type Errors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function Contact({ settings: profile, headless }: { settings: Settings; headless?: boolean }) {
  const { notify } = useIsland();
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setSending(true);
    setErrors({});
    const loading = notify({ title: "Envoi en cours…", subtitle: "Un instant", tone: "typing", duration: 0 });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        notify({ title: "Message non envoyé", subtitle: json.message ?? "Vérifiez le formulaire", tone: "error" });
        return;
      }
      form.reset();
      notify({ title: "Message envoyé", subtitle: "Je vous réponds rapidement 🙌", tone: "success" });
    } catch {
      notify({ title: "Connexion impossible", subtitle: "Réessayez dans un instant", tone: "error" });
    } finally {
      setSending(false);
      void loading;
    }
  }

  return (
    <section id="contact" className={`mx-auto max-w-6xl px-4 ${headless ? "pt-10" : "pt-28"}`}>
      {!headless && <SectionTitle eyebrow="// contact" title="Travaillons ensemble" intro={`${profile.availability}. Écrivez-moi pour un stage, un projet réseau ou un échange technique.`} />}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Reveal className="glass flex flex-col gap-3 self-start rounded-[2.25rem] p-6">
          <a href={`mailto:${profile.email}`} onClick={() => track("contact_click", "email")} className="flex items-center gap-3 rounded-[1.4rem] bg-white/5 p-4 transition-colors hover:bg-white/10">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ultra-500/70">
              <Mail size={18} />
            </span>
            <span>
              <span className="block text-xs text-ultra-200/70">Email</span>
              <span className="text-sm font-medium">{profile.email}</span>
            </span>
          </a>
          <div className="flex items-center gap-3 rounded-[1.4rem] bg-white/5 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ultra-500/70">
              <MapPin size={18} />
            </span>
            <span>
              <span className="block text-xs text-ultra-200/70">Localisation</span>
              <span className="text-sm font-medium">{profile.location} 🇧🇯</span>
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="glass rounded-[2.25rem] p-6 sm:p-8">
          <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Nom" error={errors.name} autoComplete="name" />
            <Field name="email" label="Email" type="email" error={errors.email} autoComplete="email" />
            <div className="sm:col-span-2">
              <Field name="subject" label="Sujet" error={errors.subject} />
            </div>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm text-ultra-200/80">Message</span>
              <textarea name="message" rows={5} className="field resize-none" placeholder="Bonjour Urbain, …" />
              {errors.message && <span className="mt-1 block text-xs text-red-300">{errors.message}</span>}
            </label>
            {/* piège anti-spam : invisible pour les humains */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <div className="sm:col-span-2">
              <button type="submit" disabled={sending} className="btn btn-primary w-full sm:w-auto disabled:opacity-60">
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Envoyer le message
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ name, label, type = "text", error, autoComplete }: { name: string; label: string; type?: string; error?: string; autoComplete?: string }) {
  return (
    <label>
      <span className="mb-1.5 block text-sm text-ultra-200/80">{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} className="field" />
      {error && <span className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}
