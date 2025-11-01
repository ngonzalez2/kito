'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[App] global error boundary', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-sand/10 px-4 text-center">
      <h1 className="text-3xl font-semibold text-deep-blue">Algo salió mal</h1>
      <p className="max-w-md text-base text-deep-blue/70">
        Tuvimos un problema al cargar la aplicación. Intenta nuevamente o regresa al inicio.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset?.()}
          className="rounded-full border border-deep-blue px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-deep-blue transition hover:bg-deep-blue hover:text-white"
        >
          Reintentar
        </button>
        <Link href="/" className="rounded-full border border-coral px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-coral transition hover:bg-coral hover:text-white">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
