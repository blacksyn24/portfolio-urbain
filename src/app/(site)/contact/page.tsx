import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Contact } from "@/components/sections/Contact";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader eyebrow="// contact" title="Travaillons ensemble" intro={`${s.availability}. Écrivez-moi pour un stage, un projet réseau ou un échange technique.`} />
      <Contact settings={s} headless />
    </>
  );
}
