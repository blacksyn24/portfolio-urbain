import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { fmtDate, PostCard, readingTime } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";
import { getPost, getPosts } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: p.cover_url ? { images: [p.cover_url] } : undefined } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const others = all.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-32 sm:pt-36">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ultra-300 hover:text-white">
        <ArrowLeft size={16} /> Tous les articles
      </Link>
      <Reveal>
        <p className="flex flex-wrap items-center gap-3 font-mono text-xs text-ultra-300">
          <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {fmtDate(post.published_at)}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} /> {readingTime(post.content)} min de lecture</span>
        </p>
        <h1 className="text-gradient mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-ultra-200/85">{post.excerpt}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      </Reveal>
      {post.cover_url && (
        <Reveal delay={0.05} className="glass mt-8 overflow-hidden rounded-[2.4rem] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_url} alt="" className="max-h-[440px] w-full rounded-[2rem] object-cover" />
        </Reveal>
      )}
      <div className="glass mt-6 rounded-[2.4rem] p-6 sm:p-10">
        <Markdown>{post.content}</Markdown>
      </div>
      {others.length > 0 && (
        <section className="pt-20">
          <h2 className="mb-6 text-2xl font-semibold">À lire aussi</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {others.map((o) => (
              <PostCard key={o.slug} post={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
