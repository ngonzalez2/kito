'use client';

import Link from 'next/link';
import useTranslations from '@/hooks/useTranslations';

export default function ListingsEmptyState() {
  const { listings } = useTranslations();
  return (
    <div className="rounded-3xl border border-dashed border-sand/60 bg-white/60 p-12 text-center">
      <p className="text-base text-deep-blue/70">{listings.empty}</p>
      <Link href="/sell" className="mt-6 inline-flex rounded-full border border-coral px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-coral">
        {listings.emptyCta}
      </Link>
    </div>
  );
}
