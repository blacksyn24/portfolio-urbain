import type { DocumentItem } from "./types";

export const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} Mo` : b > 0 ? `${Math.max(1, Math.round(b / 1024))} Ko` : "");

/** Lien qui force le téléchargement (paramètre Supabase ?download=). */
export const downloadUrl = (d: DocumentItem) =>
  d.file_url.includes("/storage/v1/object/public/") ? `${d.file_url}?download=${encodeURIComponent(d.file_name || "document")}` : d.file_url;
