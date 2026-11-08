import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="glass glass-strong max-w-md rounded-[2.5rem] p-10 text-center">
        <p className="font-mono text-sm text-ultra-300">echo_404</p>
        <h1 className="text-gradient mt-2 text-4xl font-semibold">Page introuvable</h1>
        <p className="mt-3 text-ultra-200/75">Ce paquet s&apos;est perdu en route. Retour à la passerelle par défaut ?</p>
        <Link href="/" className="btn btn-primary mt-6">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
