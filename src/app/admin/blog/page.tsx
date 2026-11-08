"use client";

import { Crud } from "@/components/admin/Crud";
import { slugify } from "@/lib/slug";

export default function BlogAdmin() {
  return (
    <Crud
      table="posts"
      title="Blog"
      intro="Écrivez vos articles : writeups de labs, retours d'expérience, notes de cours."
      itemLabel="Article"
      primary={(r) => String(r.title)}
      secondary={(r) => `${r.published ? "Publié" : "Brouillon"}${r.pdf_url ? " · 📄 PDF" : ""} · ${new Date(String(r.published_at)).toLocaleDateString("fr-FR")} · ${(r.tags as string[]).join(", ")}`}
      defaults={{ title: "", excerpt: "", content: "", cover_url: "", pdf_url: "", pdf_name: "", pdf_size: 0, pdf_preview_url: "", tags: [], published: false, published_at: new Date().toISOString() }}
      beforeSave={(v) => ({ ...v, slug: v.slug || slugify(String(v.title)), updated_at: new Date().toISOString() })}
      fields={[
        { name: "title", label: "Titre", type: "text", required: true },
        { name: "excerpt", label: "Résumé (affiché dans la liste)", type: "textarea" },
        { name: "content", label: "Contenu de l'article", type: "markdown" },
        { name: "pdf_url", label: "Document PDF joint (facultatif)", type: "pdf", folder: "blog/pdf", nameField: "pdf_name", sizeField: "pdf_size", previewField: "pdf_preview_url" },
        { name: "cover_url", label: "Image de couverture (sinon : aperçu du PDF)", type: "image", folder: "blog" },
        { name: "tags", label: "Étiquettes", type: "tags", help: "Ex. : CCNA, VLAN, Cybersécurité" },
        { name: "published_at", label: "Date de publication", type: "datetime" },
        { name: "published", label: "Publié (sinon : brouillon invisible)", type: "bool" },
      ]}
    />
  );
}
