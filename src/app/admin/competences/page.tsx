"use client";

import { Crud } from "@/components/admin/Crud";

export default function CompetencesAdmin() {
  return (
    <Crud
      table="skill_groups"
      title="Compétences"
      intro="Regroupez vos compétences par domaine."
      itemLabel="Groupe"
      primary={(r) => String(r.name)}
      secondary={(r) => (r.items as string[]).join(", ")}
      defaults={{ name: "", icon: "network", items: [], published: true }}
      fields={[
        { name: "name", label: "Nom du domaine", type: "text", required: true },
        { name: "items", label: "Compétences", type: "tags", help: "Séparées par des virgules" },
        {
          name: "icon",
          label: "Icône",
          type: "select",
          options: [
            { value: "route", label: "Routage" },
            { value: "network", label: "Réseau" },
            { value: "shield", label: "Sécurité" },
            { value: "flask", label: "Labo" },
            { value: "terminal", label: "Terminal" },
            { value: "code", label: "Code" },
          ],
        },
        { name: "published", label: "Publié sur le site", type: "bool" },
      ]}
    />
  );
}
