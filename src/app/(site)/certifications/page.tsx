import { Award, BadgeCheck, FileText, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { BadgeCard, CertificateCard } from "@/components/Credentials";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { getCertifications } from "@/lib/data";

export const metadata: Metadata = {
  title: "Certifications",
  description: "Certificats et badges Cisco Networking Academy d'Urbain Sedami LANDJIDE, vérifiables en ligne.",
};

export default async function CertificationsPage() {
  const certs = await getCertifications();
  // Les plus récents d'abord
  const byDate = [...certs].sort((a, b) => (b.issued_on ?? b.year).localeCompare(a.issued_on ?? a.year));
  const certificates = byDate.filter((c) => c.certificate_url);
  const badges = byDate.filter((c) => c.badge_url);
  const academies = new Set(certs.map((c) => c.academy).filter(Boolean));

  const stats = [
    { icon: FileText, value: certificates.length, label: `certificat${certificates.length > 1 ? "s" : ""}` },
    { icon: BadgeCheck, value: badges.length, label: `badge${badges.length > 1 ? "s" : ""} vérifié${badges.length > 1 ? "s" : ""}` },
    { icon: GraduationCap, value: academies.size, label: `académie${academies.size > 1 ? "s" : ""} Cisco` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="// certifications"
        title="Certificats & badges"
        intro="Mes formations validées auprès de la Cisco Networking Academy. Chaque certificat est consultable, et chaque badge se vérifie en ligne sur Credly."
      >
        <div className="mt-7 flex flex-wrap gap-3">
          {stats.map((s) => (
            <span key={s.label} className="glass inline-flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 text-sm">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ultra-500/60">
                <s.icon size={15} />
              </span>
              <b className="text-base text-white">{s.value}</b>
              <span className="text-ultra-200/80">{s.label}</span>
            </span>
          ))}
        </div>
      </PageHeader>

      {badges.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <Reveal>
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold">
              <BadgeCheck className="text-ultra-300" /> Badges vérifiés
            </h2>
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-2">
            {badges.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.06} className="min-w-0">
                <BadgeCard c={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {certificates.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <Reveal>
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold">
              <FileText className="text-ultra-300" /> Certificats
            </h2>
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-2">
            {certificates.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.06} className="min-w-0">
                <CertificateCard c={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {!certs.length && (
        <section className="mx-auto max-w-6xl px-4 pt-14">
          <p className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">
            <Award className="mx-auto mb-3" /> Les certifications arrivent bientôt.
          </p>
        </section>
      )}
    </>
  );
}
