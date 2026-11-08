import type { Metadata } from "next";
import { PostCover } from "@/components/Covers";
import { GlassCarousel } from "@/components/GlassCarousel";
import { PageHeader } from "@/components/PageHeader";
import { fmtDate, PostCard, readingTime } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { getPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader eyebrow="// blog" title="Blog" intro="Writeups de labs, retours d'expérience CCNA, notes de cybersécurité." />
      {posts.length > 1 && (
        <GlassCarousel
          label="Derniers articles"
          items={posts.slice(0, 7).map((p) => ({
            key: p.slug,
            title: p.title,
            meta: `${fmtDate(p.published_at)} · ${p.pdf_url ? "PDF" : `${readingTime(p.content)} min`}`,
            description: p.excerpt,
            image: p.cover_url || p.pdf_preview_url || undefined,
            cover: <PostCover tag={p.tags[0]} />,
            thumbText: "📝",
            href: `/blog/${p.slug}`,
          }))}
        />
      )}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        {posts.length > 1 && <div className="pt-10"><SectionTitle eyebrow="// tous les articles" title={`${posts.length} articles`} /></div>}
        {posts.length === 0 ? (
          <p className="glass rounded-[2rem] p-10 text-center text-ultra-200/70">Les premiers articles arrivent bientôt.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.05}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
