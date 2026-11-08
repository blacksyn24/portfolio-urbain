import "server-only";
import * as fallback from "@/content/profile";
import { serverClient } from "./supabase";
import type { SiteData, Settings } from "./types";

const fallbackData: SiteData = {
  settings: {
    first_name: fallback.profile.firstName,
    last_name: fallback.profile.lastName,
    handle: fallback.profile.handle,
    title: fallback.profile.title,
    subtitle: fallback.profile.subtitle,
    tagline: fallback.profile.tagline,
    location: fallback.profile.location,
    email: fallback.profile.email,
    availability: fallback.profile.availability,
    photo_url: fallback.profile.photo,
    cv_url: "",
    about: fallback.profile.about,
    languages: fallback.profile.languages,
    interests: fallback.profile.interests,
    highlights: fallback.profile.highlights,
    socials: fallback.profile.socials,
    chatbot_enabled: true,
    chatbot_instructions: "",
  },
  skills: fallback.skillGroups.map((g, i) => ({ id: String(i), ...g, position: i, published: true })),
  projects: fallback.projects.map((p, i) => ({
    id: p.slug, ...p, content: "", cover_url: "", demo_url: "", repo_url: "", featured: i < 3, published: true, position: i,
  })),
  timeline: fallback.timeline.map((t, i) => ({ id: String(i), ...t, position: i, published: true })),
  certifications: fallback.certifications.map((c, i) => ({ id: String(i), ...c, credential_url: "", position: i, published: true })),
};

/** Contenu public du site, lu dans Supabase (repli sur le contenu local si la base est injoignable). */
export async function getSiteData(): Promise<SiteData> {
  try {
    const db = serverClient();
    const [s, sk, p, t, c] = await Promise.all([
      db.from("settings").select("*").eq("id", 1).single(),
      db.from("skill_groups").select("*").eq("published", true).order("position"),
      db.from("projects").select("*").eq("published", true).order("position"),
      db.from("timeline").select("*").eq("published", true).order("position"),
      db.from("certifications").select("*").eq("published", true).order("position"),
    ]);
    const err = s.error || sk.error || p.error || t.error || c.error;
    if (err) throw err;
    return {
      settings: s.data as Settings,
      skills: sk.data ?? [],
      projects: p.data ?? [],
      timeline: t.data ?? [],
      certifications: c.data ?? [],
    };
  } catch (e) {
    console.error("[data] Supabase indisponible, contenu local utilisé :", e);
    return fallbackData;
  }
}
