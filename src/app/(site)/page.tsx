import { ArrowRight, Award, BookOpen, Download, FileDown, FlaskConical, FolderGit2, Layers, Mail, User } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { FeaturedProjects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { fmtSize } from "@/lib/docs";
import { getCertifications, getDocuments, getPosts, getProjects, getSettings, getSkills, getTimeline } from "@/lib/data";

export default async function HomePage() {
  const [s, projects, certs, posts, docs, skills, timeline] = await Promise.all([getSettings(), getProjects(), getCertifications(), getPosts(), getDocuments(), getSkills(), getTimeline()]);
  const shortcuts = [
    { href: "/a-propos", icon: User, title: "À propos", text: `${skills.reduce((n, g) => n + g.items.length, 0)} compétences en ${skills.length} domaines` },
    { href: "/ressources", icon: FileDown, title: "Ressources", text: docs.length ? `${docs.length} document${docs.length > 1 ? "s" : ""} à télécharger` : "Cours, cheatsheets et rapports de labs" },
    { href: "/contact", icon: Mail, title: "Contact", text: s.availability },
  ];

  // Chiffres clés, calculés à partir du contenu publié
  const labs = projects.filter((p) => p.category === "Lab");
  const stats = [
    { icon: FlaskConical, value: labs.length, label: "labs réseau documentés", href: "/projets" },
    { icon: Award, value: certs.filter((c) => c.status === "obtenue").length, label: "certifications Cisco", href: "/certifications" },
    { icon: Layers, value: skills.reduce((n, g) => n + g.items.length, 0), label: "compétences pratiquées", href: "/a-propos" },
    { icon: FolderGit2, value: projects.filter((p) => p.repo_url).length, label: "dépôts GitHub publics", href: s.socials?.find((x) => /github/i.test(x.label + x.url))?.url || "/projets" },
  ];
  // Les outils de labo les plus utilisés (GNS3, Packet Tracer…)
  const tools = ["Packet Tracer", "GNS3", "PNETLab"].map((t) => ({ t, n: labs.filter((p) => p.tags.includes(t)).length })).filter((x) => x.n > 0);

  return (
    <>
      <Hero settings={s} />

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pt-5 sm:grid-cols-3">
        {shortcuts.map((c, i) => (
          <Reveal key={c.href} delay={i * 0.05} className="min-w-0">
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

      {/* Chiffres clés */}
      <section className="mx-auto max-w-6xl px-4 pt-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((x, i) => (
            <Reveal key={x.label} delay={i * 0.05} className="min-w-0">
              <Link href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} className="glass group block h-full rounded-[1.8rem] p-5 transition-transform hover:-translate-y-0.5">
                <x.icon size={19} className="text-ultra-300" />
                <p className="mt-3 text-4xl font-semibold tracking-tight">{x.value}</p>
                <p className="mt-1 text-sm text-ultra-200/75">{x.label}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        {tools.length > 0 && (
          <p className="mt-4 text-center font-mono text-xs text-ultra-200/60">
            Labs réalisés sur {tools.map((x) => `${x.t} (${x.n})`).join(" · ")}
          </p>
        )}
      </section>

      <FeaturedProjects projects={projects} />

      {/* Compétences */}
      <Skills skills={skills} />
      <div className="mx-auto mt-6 flex max-w-6xl justify-center px-4">
        <Link href="/a-propos" className="btn btn-glass">
          En savoir plus sur moi <ArrowRight size={17} />
        </Link>
      </div>

      {/* Parcours et certifications */}
      <Journey timeline={timeline} certifications={certs} />

      {/* Ressources gratuites */}
      {docs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="// ressources" title="Ressources gratuites" intro="Des guides que j'ai rédigés pour aider d'autres étudiants à se former." />
            <Link href="/ressources" className="btn btn-glass mb-10">
              Toutes les ressources <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {docs.slice(0, 4).map((d, i) => (
              <Reveal key={d.id} delay={i * 0.06}>
                <div className="glass flex h-full gap-5 rounded-[2rem] p-5">
                  {d.preview_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.preview_url} alt="" className="h-36 w-28 shrink-0 rounded-xl bg-white object-cover object-top shadow-lg" />
                  ) : (
                    <span className="grid h-36 w-28 shrink-0 place-items-center rounded-xl bg-white/5">
                      <BookOpen size={28} className="text-ultra-200/60" />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-mono text-[0.7rem] uppercase tracking-widest text-ultra-300">
                      {d.category} · {fmtSize(d.file_size)}
                    </span>
                    <h3 className="mt-1.5 font-semibold leading-snug">{d.title}</h3>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-ultra-200/70">{d.description}</p>
                    <a href={d.file_url} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ultra-200 hover:text-white">
                      <Download size={15} /> Télécharger le PDF
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

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
