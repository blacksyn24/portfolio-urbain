"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Mise en page inspirée du modèle choisi par Urbain, aux couleurs du site (Ultramarine + Liquid Glass).
const C = { muted: "#afc5f8", accent: "#6e92f2" };

export const REMEMBER_KEY = "admin-remember";

export function AdminLogin({ denied, db }: { denied: boolean; db: SupabaseClient }) {
  const [error, setError] = useState(denied ? "Ce compte n'a pas accès au dashboard." : "");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [photo, setPhoto] = useState("/images/urbain.jpg");

  useEffect(() => {
    db.from("settings")
      .select("photo_url")
      .eq("id", 1)
      .single()
      .then(({ data }) => data?.photo_url && setPhoto(data.photo_url));
  }, [db]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
      sessionStorage.setItem(REMEMBER_KEY, "1"); // session active dans cet onglet
    } catch {}
    const { error } = await db.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) setError(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
  }

  return (
    <div className="relative z-[55] grid min-h-dvh place-items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        className="glass glass-strong grid w-full max-w-4xl overflow-hidden rounded-[2.25rem] md:grid-cols-[1fr_1.05fr]"
      >
        {/* Formulaire */}
        <div className="flex flex-col px-7 py-9 sm:px-12 sm:py-12">
          <div className="flex gap-6 text-sm">
            <span className="border-b-2 pb-1.5 font-semibold text-white" style={{ borderColor: C.accent }}>
              Connexion
            </span>
            <span className="pb-1.5 text-ultra-200/60">
              Dashboard
            </span>
          </div>

          <div className="mt-12 sm:mt-16">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Content de te revoir !</h1>
            <p className="mt-2 text-sm text-ultra-200/80">Connecte-toi pour gérer ton portfolio.</p>
          </div>

          <form onSubmit={submit} className="mt-9 space-y-4">
            <Field label="Email">
              <input name="email" type="email" required autoComplete="email" className="w-full bg-transparent text-[0.95rem] text-white outline-none placeholder:text-white/40" placeholder="ton@email.com" />
            </Field>
            <Field label="Mot de passe">
              <div className="flex items-center gap-2">
                <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="w-full bg-transparent text-[0.95rem] tracking-wide text-white outline-none placeholder:text-white/40" placeholder="••••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} style={{ color: C.muted }} className="hover:text-white">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm text-white/80">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" style={{ accentColor: C.accent }} />
              Se souvenir de moi
            </label>

            {error && (
              <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}
            {denied && (
              <button type="button" onClick={() => db.auth.signOut()} className="text-sm text-ultra-200 underline">
                Se déconnecter
              </button>
            )}

            <button disabled={busy} className="btn btn-primary mt-3 w-full disabled:opacity-60 sm:w-48">
              {busy && <Loader2 size={16} className="animate-spin" />} Se connecter
            </button>
          </form>

          <p className="mt-auto pt-10 text-xs text-ultra-200/60">
            Accès réservé à l&apos;administrateur · <a href="/" className="underline hover:text-white">Retour au site</a>
          </p>
        </div>

        {/* Photo */}
        <div className="relative hidden min-h-[560px] md:block">
          <Image src={photo} alt="" fill priority sizes="(min-width: 768px) 460px, 0px" className="object-cover object-[50%_25%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/85" />
          <div className="absolute bottom-7 left-7 right-7">
            <p className="text-lg font-semibold text-white">Urbain Sedami LANDJIDE</p>
            <p className="text-sm" style={{ color: C.accent }}>
              echo_404 · Réseaux & Cybersécurité
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl border-l-[3px] border-transparent bg-ink-950/45 px-4 pb-2.5 pt-2 shadow-[inset_0_0_0_1px_rgb(255_255_255/.08)] transition-colors focus-within:border-ultra-300">
      <span className="block text-[0.7rem] text-ultra-200/70">
        {label}
      </span>
      {children}
    </label>
  );
}
