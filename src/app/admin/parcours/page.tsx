"use client";

import { Crud } from "@/components/admin/Crud";

export default function ParcoursAdmin() {
  return (
    <Crud
      table="timeline"
      title="Parcours"
      intro="Formations, expériences, projets et compétitions."
      itemLabel="Étape"
      primary={(r) => String(r.title)}
      secondary={(r) => `${r.period} · ${r.place}`}
      defaults={{ period: "", title: "", place: "", detail: "", kind: "formation", current: false, published: true }}
      fields={[
        { name: "period", label: "Période", type: "text", required: true, placeholder: "2025 — 2028" },
        { name: "title", label: "Intitulé", type: "text", required: true },
        { name: "place", label: "Établissement / entreprise", type: "text" },
        { name: "detail", label: "Détails", type: "textarea" },
        {
          name: "kind",
          label: "Type",
          type: "select",
          options: [
            { value: "formation", label: "Formation" },
            { value: "experience", label: "Expérience" },
            { value: "projet", label: "Projet" },
            { value: "competition", label: "Compétition" },
          ],
        },
        { name: "current", label: "En cours (mis en évidence)", type: "bool" },
        { name: "published", label: "Publié sur le site", type: "bool" },
      ]}
    />
  );
}
