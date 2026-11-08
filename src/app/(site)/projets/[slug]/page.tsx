import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { Markdown } from "@/components/Markdown";
import { Reveal } from "@/components/Reveal";
import { ProjectCard, ProjectCover, ProjectLinks } from "@/components/sections/Projects";
import { getProject, getProjects } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjetPage({ params }: Props) {
  const { slug } = await params;
  const [p, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!p) notFound();
  const others = all.filter((x) => x.slug !== p.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-4xl px-4 pt-32 sm:pt-36">
      <Link href="/projets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ultra-300 hover:text-white">
        <ArrowLeft size={16} /> Tous les projets
      </Link>
      <Reveal>
        <h1 className="text-gradient text-4xl font-semibold tracking-tight sm:text-5xl">{p.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ultra-200/85">{p.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span key={t} className="chip font-mono !text-[0.72rem]">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6">
          <ProjectLinks p={p} />
        </div>
      </Reveal>
      <Reveal delay={0.06} className="glass mt-8 rounded-[2.4rem] p-2">
        <ProjectCover p={p} className="h-64 sm:h-96" />
      </Reveal>
      {p.content ? (
        <div className="glass mt-6 rounded-[2.4rem] p-6 sm:p-10">
          <Markdown>{p.content}</Markdown>
        </div>
      ) : null}

      <Gallery images={p.gallery ?? []} title={p.title} />

      {others.length > 0 && (
        <section className="pt-20">
          <h2 className="mb-6 text-2xl font-semibold">Autres projets</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {others.map((o) => (
              <ProjectCard key={o.slug} p={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
