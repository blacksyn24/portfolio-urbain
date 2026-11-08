import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Projets & labs" };

export default async function ProjetsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader eyebrow="// projets & labs" title="Projets & laboratoires" intro="Labs réseau documentés (CCNA, GNS3, multi-constructeurs) et projets réalisés en formation ou en stage." />
      <ProjectsExplorer projects={projects} />
    </>
  );
}
