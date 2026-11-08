import { Reveal } from "./Reveal";

/** En-tête des pages intérieures. */
export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-32 sm:pt-36">
      <Reveal className="max-w-3xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="text-gradient text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-lg leading-relaxed text-ultra-200/80">{intro}</p>}
        {children}
      </Reveal>
    </header>
  );
}
