import type { Metadata } from "next";
import { DocumentsList } from "@/components/DocumentsList";
import { PageHeader } from "@/components/PageHeader";
import { getDocuments } from "@/lib/data";

export const metadata: Metadata = { title: "Ressources" };

export default async function RessourcesPage() {
  const docs = await getDocuments();
  return (
    <>
      <PageHeader eyebrow="// ressources" title="Documents à télécharger" intro="Rapports de labs, cheatsheets Cisco, cours et documentation technique — libres de téléchargement." />
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <DocumentsList documents={docs} />
      </section>
    </>
  );
}
