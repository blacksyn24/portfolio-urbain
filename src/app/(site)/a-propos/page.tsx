import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { SectionTitle } from "@/components/SectionTitle";
import { getSettings, getSkills } from "@/lib/data";

export const metadata: Metadata = { title: "À propos" };

export default async function AProposPage() {
  const [s, skills] = await Promise.all([getSettings(), getSkills()]);
  return (
    <>
      <PageHeader eyebrow="// à propos" title="Apprendre en construisant" intro={s.tagline} />
      <About settings={s} headless />
      {skills.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-24">
          <SectionTitle eyebrow="// compétences" title="Ma stack technique" intro="Regroupée par domaine, et pratiquée en laboratoire." />
        </div>
      )}
      <Skills skills={skills} headless />
    </>
  );
}
