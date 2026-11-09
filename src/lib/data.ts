import "server-only";
import { cache } from "react";
import * as fallback from "@/content/profile";
import { serverClient } from "./supabase";
import type { Certification, DocumentItem, Post, Project, Settings, SiteData, SkillGroup, TimelineItem } from "./types";

// Contenu local de secours si Supabase est injoignable.
const fb: SiteData = {
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
  certifications: fallback.certifications.map((c, i) => ({ id: String(i), ...c, credential_url: "", badge_url: "", issued_on: null, academy: "", credential_id: "", description: "", skills: [], certificate_url: "", certificate_name: "", certificate_size: 0, certificate_preview_url: "", position: i, published: true })),
};

async function read<T>(label: string, run: () => PromiseLike<{ data: unknown; error: unknown }>, fallbackValue: T): Promise<T> {
  try {
    const { data, error } = await run();
    if (error) throw error;
    return (data as T) ?? fallbackValue;
  } catch (e) {
    console.error(`[data] ${label} : Supabase indisponible, contenu de secours utilisé`, e);
    return fallbackValue;
  }
}

const db = () => serverClient();

export const getSettings = cache(() => read<Settings>("settings", () => db().from("settings").select("*").eq("id", 1).single(), fb.settings));
export const getSkills = cache(() => read<SkillGroup[]>("skills", () => db().from("skill_groups").select("*").eq("published", true).order("position"), fb.skills));
export const getProjects = cache(() => read<Project[]>("projects", () => db().from("projects").select("*").eq("published", true).order("position"), fb.projects));
export const getProject = cache(async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null);
export const getTimeline = cache(() => read<TimelineItem[]>("timeline", () => db().from("timeline").select("*").eq("published", true).order("position"), fb.timeline));
export const getCertifications = cache(() =>
  read<Certification[]>("certifications", () => db().from("certifications").select("*").eq("published", true).order("position"), fb.certifications)
);
export const getPosts = cache(() =>
  read<Post[]>("posts", () => db().from("posts").select("*").eq("published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }), [])
);
export const getPost = cache(async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null);
export const getDocuments = cache(() => read<DocumentItem[]>("documents", () => db().from("documents").select("*").eq("published", true).order("position"), []));

/** Tout le contenu (utilisé par le chatbot). */
export async function getSiteData(): Promise<SiteData> {
  const [settings, skills, projects, timeline, certifications] = await Promise.all([getSettings(), getSkills(), getProjects(), getTimeline(), getCertifications()]);
  return { settings, skills, projects, timeline, certifications };
}
