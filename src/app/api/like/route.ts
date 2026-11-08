import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { serverClient } from "@/lib/supabase";

const body = z.object({ slug: z.string().min(1).max(100), like: z.boolean() });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`like:${ip}`, 30, 60_000)) return NextResponse.json({ message: "Trop de clics, doucement 🙂" }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Requête invalide" }, { status: 400 });
  const { data, error } = await serverClient().rpc("like_project", { p_slug: parsed.data.slug, p_delta: parsed.data.like ? 1 : -1 });
  if (error) return NextResponse.json({ message: "Impossible pour le moment" }, { status: 500 });
  return NextResponse.json({ likes: data ?? 0 });
}
