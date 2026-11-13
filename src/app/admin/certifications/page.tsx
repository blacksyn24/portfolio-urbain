"use client";

import { Crud } from "@/components/admin/Crud";

const statusLabel: Record<string, string> = { obtenue: "Obtenue", "en-cours": "En cours", planifiee: "Planifiée" };

export default function CertificationsAdmin() {
  return (
    <Crud
      table="certifications"
      title="Certifications & badges"
      intro="Chaque fiche peut avoir un certificat (PDF, aperçu généré automatiquement) et/ou un badge (image + lien Credly). Sur le site, les certificats et les badges s'affichent dans deux sections séparées."
      itemLabel="Certification"
      primary={(r) => String(r.name)}
      image={(r) => String(r.certificate_preview_url || r.badge_url || "")}
      badge={(r) => statusLabel[String(r.status)]}
      link={(r) => String(r.certificate_url || r.credential_url || "")}
      secondary={(r) =>
        [r.academy || r.issuer, r.issued_on ? new Date(String(r.issued_on)).toLocaleDateString("fr-FR") : r.year, statusLabel[String(r.status)], r.certificate_url ? "PDF" : "", r.badge_url ? "badge" : ""]
          .filter(Boolean)
          .join(" · ")
      }
      defaults={{
        name: "",
        issuer: "Cisco Networking Academy",
        academy: "",
        year: String(new Date().getFullYear()),
        issued_on: null,
        status: "obtenue",
        credential_id: "",
        credential_url: "",
        badge_url: "",
        description: "",
        skills: [],
        certificate_url: "",
        certificate_name: "",
        certificate_size: 0,
        certificate_preview_url: "",
        published: true,
      }}
      fields={[
        { name: "name", label: "Nom", type: "text", required: true },
        { name: "issuer", label: "Organisme", type: "text" },
        { name: "academy", label: "Académie / établissement", type: "text", placeholder: "Pigier Bénin" },
        { name: "issued_on", label: "Date d'obtention", type: "date" },
        { name: "year", label: "Année (si pas de date précise)", type: "text" },
        { name: "status", label: "Statut", type: "select", options: Object.entries(statusLabel).map(([value, label]) => ({ value, label })) },
        { name: "description", label: "Description", type: "textarea" },
        { name: "skills", label: "Compétences", type: "tags" },
        { name: "certificate_url", label: "Certificat (PDF)", type: "pdf", folder: "certifications", nameField: "certificate_name", sizeField: "certificate_size", previewField: "certificate_preview_url" },
        { name: "credential_id", label: "N° du certificat (Cert ID)", type: "text" },
        { name: "badge_url", label: "Image du badge", type: "image", folder: "badges" },
        { name: "credential_url", label: "Lien du badge (Credly…)", type: "url", placeholder: "https://www.credly.com/badges/…" },
        { name: "published", label: "Publié sur le site", type: "bool" },
      ]}
    />
  );
}
