import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sand/10 px-4 text-center">
      <h1 className="text-3xl font-semibold text-deep-blue">Página no encontrada</h1>
      <p className="max-w-md text-base text-deep-blue/70">
        No pudimos encontrar la página que buscas. Revisa la URL o vuelve al inicio para seguir explorando
        equipo.
      </p>
      <Link href="/" className="rounded-full border border-coral px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-coral transition hover:bg-coral hover:text-white">
        Volver al inicio
      </Link>
    </div>
  );
}
