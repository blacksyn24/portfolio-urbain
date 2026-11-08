import { FileText } from "lucide-react";
import type { Post } from "@/lib/types";
import { PostCover } from "./Covers";
import { MediaCard } from "./MediaCard";

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const readingTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

export function PostCard({ post }: { post: Post }) {
  const cover = post.cover_url || post.pdf_preview_url || "";
  return (
    <MediaCard
      images={cover ? [cover] : []}
      fallback={<PostCover tag={post.tags[0]} />}
      href={`/blog/${post.slug}`}
      title={post.title}
      subtitle={fmtDate(post.published_at)}
      aside={<span className="text-ultra-200/80">{post.content.trim() ? `${readingTime(post.content)} min` : "PDF"}</span>}
      description={post.excerpt}
      highlight={post.tags.length ? <span className="font-mono text-sm tracking-wide text-ultra-200">{post.tags.slice(0, 3).join(" · ")}</span> : undefined}
      badge={
        post.pdf_url ? (
          <span className="chip !bg-ink-950/80 backdrop-blur-md">
            <FileText size={13} /> PDF
          </span>
        ) : undefined
      }
      cta={{ label: "Lire l'article", href: `/blog/${post.slug}` }}
    />
  );
}
