import { FileArchive, FileCode2, FileText, Network, PenLine } from "lucide-react";

const ext = (name: string) => (name.split(".").pop() ?? "").toLowerCase();

/** Couverture automatique pour un document (PDF, .pkt, .gns3…). */
export function DocCover({ fileName, category }: { fileName: string; category: string }) {
  const e = ext(fileName);
  const Icon = e === "pkt" || e === "gns3" ? Network : e === "pdf" ? FileText : e === "zip" ? FileArchive : FileCode2;
  const label = e === "pkt" ? "Packet Tracer" : e === "gns3" ? "GNS3" : e.toUpperCase() || "Fichier";
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgb(110_146_242/.55),transparent_55%),radial-gradient(circle_at_80%_90%,rgb(123_92_245/.45),transparent_50%)]">
      <div aria-hidden className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgb(255_255_255/.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.6)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative flex flex-col items-center gap-3 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/12 shadow-[inset_0_1px_0_rgb(255_255_255/.4)] backdrop-blur-md">
          <Icon size={30} className="text-white" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ultra-50">{label}</span>
        <span className="rounded-full bg-ink-950/60 px-3 py-1 text-[0.7rem] text-ultra-200">{category}</span>
      </div>
    </div>
  );
}

/** Couverture automatique pour un article sans image. */
export function PostCover({ tag }: { tag?: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_70%_20%,rgb(110_146_242/.5),transparent_55%),radial-gradient(circle_at_20%_90%,rgb(123_92_245/.45),transparent_50%)]">
      <div className="flex flex-col items-center gap-3">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/12 shadow-[inset_0_1px_0_rgb(255_255_255/.4)] backdrop-blur-md">
          <PenLine size={28} className="text-white" />
        </span>
        {tag && <span className="rounded-full bg-ink-950/60 px-3 py-1 font-mono text-[0.7rem] text-ultra-200">{tag}</span>}
      </div>
    </div>
  );
}
