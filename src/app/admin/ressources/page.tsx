"use client";

import { Crud } from "@/components/admin/Crud";

const size = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} Mo` : `${Math.max(1, Math.round(b / 1024))} Ko`);

export default function RessourcesAdmin() {
  return (
    <Crud
      table="documents"
      title="Ressources"
      intro="Documents téléchargeables par les visiteurs : PDF, cheatsheets, rapports de labs, fichiers de configuration…"
      itemLabel="Document"
      primary={(r) => String(r.title)}
      secondary={(r) => `${r.category} · ${r.file_name || "aucun fichier"}${r.file_size ? ` · ${size(Number(r.file_size))}` : ""}`}
      defaults={{ title: "", description: "", category: "Réseaux", file_url: "", file_name: "", file_size: 0, published: true }}
      fields={[
        { name: "file_url", label: "Fichier", type: "file", folder: "documents", nameField: "file_name", sizeField: "file_size" },
        { name: "title", label: "Titre", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "category",
          label: "Catégorie",
          type: "select",
          options: ["Réseaux", "Cisco", "Cybersécurité", "Linux", "Fichiers de labs", "Rapports de labs", "Cours", "Autre"].map((c) => ({ value: c, label: c })),
        },
        { name: "published", label: "Visible sur le site", type: "bool" },
      ]}
    />
  );
}
