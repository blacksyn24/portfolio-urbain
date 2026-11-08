import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Journey } from "@/components/sections/Journey";
import { getCertifications, getTimeline } from "@/lib/data";

export const metadata: Metadata = { title: "Parcours" };

export default async function ParcoursPage() {
  const [timeline, certs] = await Promise.all([getTimeline(), getCertifications()]);
  return (
    <>
      <PageHeader eyebrow="// parcours" title="Formation, expériences & certifications" intro="Mon chemin vers l'ingénierie réseau et la cybersécurité." />
      <Journey timeline={timeline} certifications={certs} headless />
    </>
  );
}
