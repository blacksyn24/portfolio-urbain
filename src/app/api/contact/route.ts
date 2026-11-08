import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { serverClient } from "@/lib/supabase";

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(100),
  email: z.string().trim().email("Email invalide").max(200),
  subject: z.string().trim().min(3, "Sujet trop court").max(150),
  message: z.string().trim().min(10, "Message trop court (10 caractères min.)").max(5000),
  website: z.string().max(0).optional(), // piège anti-robots
});

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function notifyByEmail(m: z.infer<typeof schema>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: m.email,
        subject: `📩 Portfolio — ${m.subject}`,
        html: `<p><b>${escape(m.name)}</b> (${escape(m.email)}) vous a écrit :</p><p style="white-space:pre-wrap">${escape(m.message)}</p>`,
      }),
    });
  } catch (e) {
    console.error("[contact] email non envoyé", e);
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ message: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (key === "website") return NextResponse.json({ ok: true }); // robot : ignoré en silence
      errors[key] ??= issue.message;
    }
    return NextResponse.json({ message: "Vérifiez le formulaire", errors }, { status: 422 });
  }

  const { website: _hp, ...msg } = parsed.data;
  const { error } = await serverClient().from("messages").insert(msg);
  if (error) {
    console.error("[contact] insertion impossible", error);
    return NextResponse.json({ message: "Envoi impossible pour le moment" }, { status: 500 });
  }
  await notifyByEmail(parsed.data);
  return NextResponse.json({ ok: true });
}
