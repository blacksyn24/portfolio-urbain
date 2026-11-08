import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getDocuments, getPosts, getSiteData } from "@/lib/data";
import { serverClient } from "@/lib/supabase";
import type { SiteData } from "@/lib/types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLAUDE_MODEL = "claude-opus-5-5";
// Gemini (prioritaire si GEMINI_API_KEY est défini). Repli sur un modèle stable si le premier échoue.
const GEMINI_MODELS = [process.env.GEMINI_MODEL || "gemini-3.8-flash", "gemini-2.5-flash"];
const REFUSAL = "Je ne peux pas répondre à cette question. Utilisez le formulaire de contact pour écrire directement à Urbain.";

type Msg = { role: "user" | "assistant"; content: string };

/** Réponse en flux via Gemini (Google). */
async function* geminiStream(system: string, messages: Msg[]): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    let started = false;
    try {
      const response = await ai.models.generateContentStream({ model, contents, config: { systemInstruction: system, maxOutputTokens: 1024, temperature: 0.4 } });
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          started = true;
          yield text;
        }
      }
      if (!started) yield REFUSAL;
      return;
    } catch (e) {
      lastError = e;
      console.error(`[chat] Gemini ${model} indisponible`, e);
      if (started) return; // réponse déjà partiellement envoyée : on n'enchaîne pas sur un autre modèle
    }
  }
  throw lastError;
}

/** Réponse en flux via Claude (Anthropic), si une clé Anthropic est configurée à la place. */
async function* claudeStream(system: string, messages: Msg[]): AsyncGenerator<string> {
  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages,
  } as Parameters<typeof client.beta.messages.stream>[0]);
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") yield REFUSAL;
}

const body = z.object({
  conversationId: z.string().uuid(),
  sessionId: z.string().max(64).optional().default(""),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(20),
});

function buildSystemPrompt(d: SiteData, extra: { posts: { title: string; slug: string; excerpt: string }[]; docs: { title: string; category: string }[] }): string {
  const s = d.settings;
  const fullName = `${s.first_name} ${s.last_name}`;
  const lines = [
    `Tu es l'assistant du portfolio de ${fullName} (pseudo ${s.handle}). Tu réponds aux visiteurs — souvent des recruteurs ou des entreprises — au sujet de son profil.`,
    `Réponds dans la langue du visiteur, en 2 à 5 phrases, en texte simple (pas de Markdown). Parle de ${s.first_name} à la troisième personne.`,
    `Base-toi uniquement sur les informations ci-dessous. Si une information n'y figure pas (salaire, téléphone, adresse précise, opinions…), dis que tu ne sais pas et propose le formulaire de contact du site. N'invente jamais de compétence, de diplôme ou d'expérience.`,
    "",
    "## Profil",
    `Titre : ${s.title} — ${s.subtitle}`,
    `Présentation : ${s.tagline}`,
    `Localisation : ${s.location}`,
    `Disponibilité : ${s.availability}`,
    `Email public : ${s.email}`,
    ...s.about.map((p) => `- ${p}`),
    `Langues : ${s.languages.map((l) => `${l.name} (${l.level})`).join(", ")}`,
    `Centres d'intérêt : ${s.interests.join(", ")}`,
    "",
    "## Compétences",
    ...d.skills.map((g) => `- ${g.name} : ${g.items.join(", ")}`),
    "",
    "## Projets et labs",
    ...d.projects.map((p) => `- ${p.title} (${p.category}, ${p.year}) : ${p.summary}${p.content ? ` ${p.content}` : ""} [${p.tags.join(", ")}]`),
    "",
    "## Parcours",
    ...d.timeline.map((t) => `- ${t.period} : ${t.title} — ${t.place}${t.detail ? `. ${t.detail}` : ""}`),
    "",
    "## Certifications",
    ...d.certifications.map((c) => `- ${c.name} (${c.issuer}, ${c.year}) : ${c.status === "obtenue" ? "obtenue" : c.status === "en-cours" ? "en cours" : "planifiée"}`),
  ];
  if (extra.posts.length) lines.push("", "## Articles du blog (page /blog)", ...extra.posts.map((p) => `- ${p.title} (/blog/${p.slug}) : ${p.excerpt}`));
  if (extra.docs.length) lines.push("", "## Documents téléchargeables (page /ressources)", ...extra.docs.map((x) => `- ${x.title} (${x.category})`));
  lines.push("", "Pages du site : / (accueil), /a-propos, /projets, /parcours, /blog, /ressources, /contact. Oriente le visiteur vers la bonne page quand c'est utile.");
  if (s.chatbot_instructions.trim()) lines.push("", "## Consignes supplémentaires de " + s.first_name, s.chatbot_instructions.trim());
  return lines.join("\n");
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ message: "Le chatbot n'est pas encore activé." }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`chat:${ip}`, 15, 60_000)) {
    return Response.json({ message: "Trop de messages d'un coup. Réessayez dans une minute." }, { status: 429 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Requête invalide." }, { status: 400 });
  const { conversationId, sessionId, messages } = parsed.data;
  if (messages[0].role !== "user" || messages.at(-1)!.role !== "user") {
    return Response.json({ message: "Requête invalide." }, { status: 400 });
  }

  const [data, posts, docs] = await Promise.all([getSiteData(), getPosts(), getDocuments()]);
  if (!data.settings.chatbot_enabled) {
    return Response.json({ message: "Le chatbot est désactivé pour le moment." }, { status: 503 });
  }

  const db = serverClient();
  const userMessage = messages.at(-1)!.content;
  const system = buildSystemPrompt(data, { posts, docs });
  const textStream = process.env.GEMINI_API_KEY ? geminiStream(system, messages) : claudeStream(system, messages);

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      try {
        for await (const text of textStream) {
          answer += text;
          controller.enqueue(encoder.encode(text));
        }
      } catch (e) {
        console.error("[chat]", e);
        const msg = answer ? "" : "Le chatbot est momentanément indisponible. Réessayez plus tard ou utilisez le formulaire de contact.";
        if (msg) controller.enqueue(encoder.encode(msg));
        answer ||= msg;
      } finally {
        controller.close();
        // Historique pour le dashboard (ne bloque pas la réponse)
        await db.from("chat_conversations").upsert({ id: conversationId, session_id: sessionId }, { onConflict: "id", ignoreDuplicates: true });
        await db.from("chat_messages").insert([
          { conversation_id: conversationId, role: "user", content: userMessage.slice(0, 8000) },
          { conversation_id: conversationId, role: "assistant", content: answer.slice(0, 8000) },
        ]);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
