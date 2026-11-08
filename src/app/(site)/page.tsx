import { ArrowRight, FileDown, Mail, User } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { Hero } from "@/components/sections/Hero";
import { FeaturedProjects } from "@/components/sections/Projects";
import { getCertifications, getDocuments, getPosts, getProjects, getSettings, getSkills } from "@/lib/data";

export default async function HomePage() {
  const [s, projects, certs, posts, docs, skills] = await Promise.all([getSettings(), getProjects(), getCertifications(), getPosts(), getDocuments(), getSkills()]);
  const currentCert = certs.find((c) => c.status === "en-cours");

  const shortcuts = [
    { href: "/a-propos", icon: User, title: "À propos", text: `${skills.reduce((n, g) => n + g.items.length, 0)} compétences en ${skills.length} domaines` },
    { href: "/ressources", icon: FileDown, title: "Ressources", text: docs.length ? `${docs.length} document${docs.length > 1 ? "s" : ""} à télécharger` : "Cours, cheatsheets et rapports de labs" },
    { href: "/contact", icon: Mail, title: "Contact", text: s.availability },
  ];

  return (
    <>
      <Hero settings={s} badge={currentCert ? { title: currentCert.name, year: currentCert.year } : undefined} />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-5 sm:grid-cols-3">
        {shortcuts.map((c, i) => (
          <Reveal key={c.href} delay={i * 0.05}>
            <Link href={c.href} className="glass group flex h-full items-center gap-4 rounded-[1.8rem] p-5 transition-transform hover:-translate-y-0.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ultra-500/60">
                <c.icon size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{c.title}</span>
                <span className="block truncate text-sm text-ultra-200/70">{c.text}</span>
              </span>
              <ArrowRight size={17} className="text-ultra-300 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        ))}
      </section>

      <FeaturedProjects projects={projects} />

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="// blog" title="Derniers articles" />
            <Link href="/blog" className="btn btn-glass mb-10">
              Tout le blog <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-28">
        <Reveal className="glass glass-strong flex flex-col items-start justify-between gap-6 rounded-[2.5rem] p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-gradient text-3xl font-semibold tracking-tight">Un stage, un projet réseau ?</h2>
            <p className="mt-2 text-ultra-200/80">{s.availability}. Réponse rapide garantie.</p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            Me contacter <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
