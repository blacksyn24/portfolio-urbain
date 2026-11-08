import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();
  return <Contact settings={s} />;
}
