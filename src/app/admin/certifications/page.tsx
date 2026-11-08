"use client";

import { Crud } from "@/components/admin/Crud";

const statusLabel: Record<string, string> = { obtenue: "Obtenue", "en-cours": "En cours", planifiee: "Planifiée" };

export default function CertificationsAdmin() {
  return (
    <Crud
      table="certifications"
      title="Certifications"
      intro="Certifications et badges (obtenus, en cours, planifiés). La première « En cours » s'affiche aussi sur la photo d'accueil."
      itemLabel="Certification"
      primary={(r) => String(r.name)}
      secondary={(r) => `${r.issuer} · ${r.year} · ${statusLabel[String(r.status)]}`}
      defaults={{ name: "", issuer: "Cisco Networking Academy", year: String(new Date().getFullYear()), status: "en-cours", credential_url: "", badge_url: "", published: true }}
      fields={[
        { name: "name", label: "Nom", type: "text", required: true },
        { name: "issuer", label: "Organisme", type: "text" },
        { name: "year", label: "Année", type: "text" },
        { name: "status", label: "Statut", type: "select", options: Object.entries(statusLabel).map(([value, label]) => ({ value, label })) },
        { name: "badge_url", label: "Image du badge", type: "image", folder: "badges" },
        { name: "credential_url", label: "Lien de vérification (Credly, Cisco…)", type: "url", placeholder: "https://…" },
        { name: "published", label: "Publié sur le site", type: "bool" },
      ]}
    />
  );
}
