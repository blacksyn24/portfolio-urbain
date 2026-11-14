import type { Metadata } from "next";
import { DocCover } from "@/components/Covers";
import { DocumentsList } from "@/components/DocumentsList";
import { downloadUrl, fmtSize } from "@/lib/docs";
import { GlassCarousel } from "@/components/GlassCarousel";
import { PageHeader } from "@/components/PageHeader";
import { SectionTitle } from "@/components/SectionTitle";
import { getDocuments } from "@/lib/data";

export const metadata: Metadata = { title: "Ressources" };

export default async function RessourcesPage() {
  const docs = await getDocuments();
  // Vitrine : les documents rédigés d'abord (cours, rapports…), puis les fichiers de labs
  const showcase = [...docs.filter((d) => d.category !== "Fichiers de labs"), ...docs.filter((d) => d.category === "Fichiers de labs")].slice(0, 7);
  return (
    <>
      <PageHeader eyebrow="// ressources" title="Documents à télécharger" intro="Aide-mémoires Cisco et guides de formation en PDF, que j'ai rédigés pour les étudiants en réseau. Gratuits et libres de partage." />
      {showcase.length > 1 && (
        <GlassCarousel
          label="Ressources à la une"
          openLabel="Télécharger"
          items={showcase.map((d) => ({
            key: d.id,
            title: d.title,
            meta: [d.category, fmtSize(d.file_size)].filter(Boolean).join(" · "),
            description: d.description,
            image: d.preview_url || undefined,
            cover: <DocCover fileName={d.file_name} category={d.category} />,
            thumbText: (d.file_name.split(".").pop() ?? "").toUpperCase().slice(0, 4),
            href: downloadUrl(d),
            action: { label: "Télécharger", href: downloadUrl(d), download: true, event: "document_download", eventLabel: d.title },
          }))}
        />
      )}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        {showcase.length > 1 && <div className="pt-10"><SectionTitle eyebrow="// tout parcourir" title={`Les ${docs.length} documents`} intro="Recherche et filtre par catégorie." /></div>}
        <DocumentsList documents={docs} />
      </section>
    </>
  );
}
