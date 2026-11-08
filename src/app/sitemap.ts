import type { MetadataRoute } from "next";
import { navItems } from "@/content/profile";
import { getPosts, getProjects } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-urbain.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  return [
    ...navItems.map((n) => ({ url: `${base}${n.href}`, changeFrequency: "weekly" as const })),
    ...projects.map((p) => ({ url: `${base}/projets/${p.slug}` })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.published_at })),
  ];
}
