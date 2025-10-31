'use client';

import useTranslations from '@/hooks/useTranslations';

export default function ListingsHeader({ total }) {
  const { listings } = useTranslations();
  return (
    <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
      <div>
        <h1 className="font-heading text-3xl uppercase tracking-[0.4em] text-deep-blue">{listings.heading}</h1>
        <p className="mt-2 text-sm text-deep-blue/70">{listings.subheading}</p>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-deep-blue/60">
        {listings.countLabel.replace('{count}', total)}
      </span>
    </div>
  );
}
