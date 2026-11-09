import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

/**
 * Appelée chaque jour par une tâche planifiée Vercel (voir vercel.json).
 * Une petite lecture dans la base suffit pour que le projet Supabase gratuit
 * ne soit pas mis en pause après une semaine sans visiteur.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Si CRON_SECRET est défini sur Vercel, seules les tâches planifiées peuvent appeler cette route.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { error } = await serverClient().from("settings").select("first_name").limit(1);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
