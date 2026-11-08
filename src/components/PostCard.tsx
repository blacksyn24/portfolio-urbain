import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/lib/types";

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const readingTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="glass group relative flex h-full flex-col overflow-hidden rounded-[2.25rem] p-2 transition-transform duration-500 [transition-timing-function:var(--spring)] hover:-translate-y-1">
      {post.cover_url && (
        <div className="relative h-44 overflow-hidden rounded-[1.85rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 font-mono text-xs text-ultra-300">
          <CalendarDays size={13} /> {fmtDate(post.published_at)} · {readingTime(post.content)} min
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ultra-200/80">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="chip !text-[0.7rem]">
                {t}
              </span>
            ))}
          </div>
          <ArrowRight size={17} className="shrink-0 text-ultra-300 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
}
