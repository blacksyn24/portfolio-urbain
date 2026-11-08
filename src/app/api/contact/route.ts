import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom").max(100),
  email: z.string().trim().email("Email invalide").max(200),
  subject: z.string().trim().min(3, "Sujet trop court").max(150),
  message: z.string().trim().min(10, "Message trop court (10 caractères min.)").max(5000),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Requête invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (key === "website") return NextResponse.json({ ok: true }); // bot : on ignore en silence
      errors[key] ??= issue.message;
    }
    return NextResponse.json({ message: "Vérifiez le formulaire", errors }, { status: 422 });
  }

  // Étape suivante : enregistrer dans Supabase (table messages) et envoyer un email de notification.
  console.info("[contact] nouveau message de", parsed.data.email);

  return NextResponse.json({ ok: true });
}
