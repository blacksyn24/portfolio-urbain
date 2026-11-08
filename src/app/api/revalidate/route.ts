import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase";

// Appelée par le dashboard après une modification : met à jour le site public immédiatement.
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const db = serverClient(token);
  const { data: user } = await db.auth.getUser(token);
  if (!user.user) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
