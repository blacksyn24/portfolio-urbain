"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { Loader2, LockKeyhole } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";
import { useIsland } from "../IslandProvider";

type Ctx = {
  db: SupabaseClient;
  session: Session;
  /** Met à jour le site public après une modification. */
  publish: () => Promise<void>;
  /** Envoie un fichier dans le stockage et renvoie son URL publique. */
  upload: (file: File, folder: string) => Promise<string>;
  unread: number;
  refreshUnread: () => void;
};

const AdminContext = createContext<Ctx | null>(null);

export function useAdmin() {
  const c = useContext(AdminContext);
  if (!c) throw new Error("useAdmin hors du dashboard");
  return c;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const db = browserClient();
  const { notify } = useIsland();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "out" | "denied" | "ok">("loading");
  const [unread, setUnread] = useState(0);

  const check = useCallback(
    async (s: Session | null) => {
      setSession(s);
      if (!s) return setStatus("out");
      const { data } = await db.rpc("is_admin");
      setStatus(data ? "ok" : "denied");
    },
    [db]
  );

  useEffect(() => {
    db.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => check(s));
    return () => sub.subscription.unsubscribe();
  }, [db, check]);

  const refreshUnread = useCallback(() => {
    db.from("messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .then(({ count }) => setUnread(count ?? 0));
  }, [db]);

  // Notifications en temps réel : nouveau message de contact
  useEffect(() => {
    if (status !== "ok") return;
    refreshUnread();
    const ch = db
      .channel("admin-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p) => {
        const m = p.new as { name: string; subject: string };
        notify({ title: `Nouveau message de ${m.name}`, subtitle: m.subject, tone: "info", duration: 6000 });
        refreshUnread();
      })
      .subscribe();
    return () => {
      db.removeChannel(ch);
    };
  }, [status, db, notify, refreshUnread]);

  const publish = useCallback(async () => {
    const { data } = await db.auth.getSession();
    await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } });
  }, [db]);

  const upload = useCallback(
    async (file: File, folder: string) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await db.storage.from("public-assets").upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (error) throw error;
      return db.storage.from("public-assets").getPublicUrl(path).data.publicUrl;
    },
    [db]
  );

  if (status === "loading")
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="animate-spin text-ultra-300" />
      </div>
    );
  if (status !== "ok" || !session) return <Login denied={status === "denied"} db={db} />;

  return <AdminContext.Provider value={{ db, session, publish, upload, unread, refreshUnread }}>{children}</AdminContext.Provider>;
}

function Login({ denied, db }: { denied: boolean; db: SupabaseClient }) {
  const [error, setError] = useState(denied ? "Ce compte n'a pas accès au dashboard." : "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const { error } = await db.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setBusy(false);
    if (error) setError(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="glass glass-strong w-full max-w-sm space-y-4 rounded-[2rem] p-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ultra-500/70">
          <LockKeyhole size={22} />
        </span>
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-ultra-200/70">Connexion réservée à l&apos;administrateur.</p>
        </div>
        <input name="email" type="email" required autoComplete="email" placeholder="Email" className="field" />
        <input name="password" type="password" required autoComplete="current-password" placeholder="Mot de passe" className="field" />
        {error && <p className="text-sm text-red-300">{error}</p>}
        {denied && (
          <button type="button" onClick={() => db.auth.signOut()} className="text-sm text-ultra-300 underline">
            Se déconnecter
          </button>
        )}
        <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Se connecter
        </button>
      </form>
    </div>
  );
}
