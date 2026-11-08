import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";
import { getPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader eyebrow="// blog" title="Blog" intro="Writeups de labs, retours d'expérience CCNA, notes de cybersécurité." />
      <section className="mx-auto max-w-6xl px-4 pt-10">
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
