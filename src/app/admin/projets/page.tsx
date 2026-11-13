"use client";

import { Crud } from "@/components/admin/Crud";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export default function ProjetsAdmin() {
  return (
    <Crud
      table="projects"
      title="Projets & labs"
      intro="Ajoutez vos labs avec captures, liens de démo et de code."
      itemLabel="Projet"
      primary={(r) => String(r.title)}
      image={(r) => String(r.cover_url || (r.gallery as string[] | undefined)?.[0] || "")}
      badge={(r) => `${r.category}${r.featured ? " · à la une" : ""}`}
      description={(r) => String(r.summary ?? "")}
      link={(r) => `/projets/${r.slug}`}
      secondary={(r) => `${r.category} · ${r.year} · ♥ ${r.likes ?? 0} · ${(r.tags as string[]).join(", ")}`}
      defaults={{ title: "", summary: "", content: "", tags: [], category: "Lab", year: String(new Date().getFullYear()), topology: "core", cover_url: "", gallery: [], topology_images: [], demo_url: "", repo_url: "", featured: false, published: true }}
      beforeSave={(v) => ({ ...v, slug: v.slug || slugify(String(v.title)) })}
      fields={[
        { name: "title", label: "Titre", type: "text", required: true },
        { name: "summary", label: "Résumé (affiché sur la carte)", type: "textarea", required: true },
        { name: "content", label: "Détails (utilisés aussi par le chatbot)", type: "textarea", help: "Topologie, configuration, difficultés, résultats…" },
        { name: "tags", label: "Technologies", type: "tags", help: "Ex. : GNS3, VLAN, OSPF" },
        { name: "category", label: "Catégorie", type: "select", options: [{ value: "Lab", label: "Lab" }, { value: "Projet", label: "Projet" }, { value: "Outil", label: "Outil" }, { value: "CTF", label: "CTF" }] },
        { name: "year", label: "Année", type: "text" },
        { name: "topology_images", label: "Photos de la topologie (affichées dans la section « Topologie »)", type: "gallery", folder: "projets/topologie" },
        { name: "gallery", label: "Photos du projet (captures, topologie, matériel…)", type: "gallery", folder: "projets", coverField: "cover_url" },
        { name: "cover_url", label: "Couverture de la carte (sinon : 1re photo)", type: "image", folder: "projets" },
        { name: "topology", label: "Illustration si pas d'image", type: "select", options: [{ value: "core", label: "Cœur de réseau" }, { value: "vlan", label: "Multi-VLAN" }, { value: "multi", label: "Maillé" }, { value: "web", label: "Application" }] },
        { name: "demo_url", label: "Lien de démo / rapport", type: "url", placeholder: "https://…" },
        { name: "repo_url", label: "Lien du code (GitHub…)", type: "url", placeholder: "https://github.com/…" },
        { name: "featured", label: "Mettre en avant", type: "bool" },
        { name: "published", label: "Publié sur le site", type: "bool" },
      ]}
    />
  );
}
