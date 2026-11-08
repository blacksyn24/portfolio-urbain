import { BookOpen, Download, FileText } from "lucide-react";
import { fmtSize } from "@/lib/docs";
import { TrackedLink } from "./TrackedLink";

/** Bloc « Document PDF » d'un article : aperçu, lecture en ligne, téléchargement et lecteur intégré. */
export function PdfAttachment({ url, name, size, preview }: { url: string; name: string; size: number; preview: string }) {
  const download = url.includes("/storage/v1/object/public/") ? `${url}?download=${encodeURIComponent(name || "document.pdf")}` : url;
  return (
    <section className="glass mt-6 rounded-[2.4rem] p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <a href={url} target="_blank" rel="noopener" className="shrink-0 self-center sm:self-auto" aria-label="Ouvrir le PDF">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Première page du PDF" className="h-44 w-[8.25rem] rounded-xl bg-white object-cover object-top shadow-[0_18px_40px_-12px_rgb(0_0_0/.6)] transition-transform hover:-translate-y-1" />
          ) : (
            <span className="grid h-44 w-[8.25rem] place-items-center rounded-xl bg-white/8">
              <FileText size={36} className="text-ultra-200" />
            </span>
          )}
        </a>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Document PDF</p>
          <h2 className="mt-1 truncate text-lg font-semibold text-white">{name || "Document"}</h2>
          {size > 0 && <p className="mt-0.5 text-sm text-ultra-200/65">{fmtSize(size)}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <TrackedLink event="document_download" label={`blog:${name}:lecture`} href={url} target="_blank" rel="noopener" className="btn btn-primary !py-2.5 text-sm">
              <BookOpen size={16} /> Lire en ligne
            </TrackedLink>
            <TrackedLink event="document_download" label={`blog:${name}`} href={download} className="btn btn-glass !py-2.5 text-sm">
              <Download size={16} /> Télécharger
            </TrackedLink>
          </div>
        </div>
      </div>
      {/* Lecteur intégré (ordinateur ; sur mobile, « Lire en ligne » ouvre le lecteur du téléphone) */}
      <iframe src={`${url}#view=FitH`} title={name || "Document PDF"} loading="lazy" className="mt-6 hidden h-[78vh] w-full rounded-2xl bg-white md:block" />
    </section>
  );
}
