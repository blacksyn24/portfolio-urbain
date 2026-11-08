import type { Metadata } from "next";
import { GlassCarousel } from "@/components/GlassCarousel";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { SectionTitle } from "@/components/SectionTitle";
import { Topology } from "@/components/sections/Projects";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Projets & labs" };

export default async function ProjetsPage() {
  const projects = await getProjects();
  const showcase = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, 7);
  return (
    <>
      <PageHeader eyebrow="// projets & labs" title="Projets & laboratoires" intro="Labs réseau documentés (CCNA, GNS3, multi-constructeurs) et projets réalisés en formation ou en stage." />
      {showcase.length > 1 && (
        <GlassCarousel
          label="Projets à la une"
          items={showcase.map((p) => ({
            key: p.slug,
            title: p.title,
            meta: `${p.category} · ${p.year} · ${p.tags.slice(0, 3).join(" · ")}`,
            description: p.summary,
            image: p.cover_url || p.gallery?.[0] || undefined,
            cover: (
              <div className="h-full w-full p-8">
                <Topology kind={p.topology} />
              </div>
            ),
            thumbText: p.category.slice(0, 3),
            href: `/projets/${p.slug}`,
            action: p.repo_url ? { label: "Voir sur GitHub", href: p.repo_url, event: "project_click", eventLabel: `${p.slug}:code` } : undefined,
          }))}
        />
      )}
      <div className="mx-auto max-w-6xl px-4 pt-20">
        <SectionTitle eyebrow="// tout parcourir" title={`Les ${projects.length} projets`} intro="Recherche par mot-clé, catégorie ou technologie." />
      </div>
      <ProjectsExplorer projects={projects} compact />
    </>
  );
}
