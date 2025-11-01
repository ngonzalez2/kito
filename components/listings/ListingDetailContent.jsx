'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ListingReportButton from './ListingReportButton';
import useTranslations from '@/hooks/useTranslations';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

export default function ListingDetailContent({ listing }) {
  const { listings, sell } = useTranslations();
  const [imageSrc, setImageSrc] = useState(listing.imageUrl || PLACEHOLDER_IMAGE);
  const categoryLabel = listing.category ? listings.categories?.[listing.category] ?? listing.category : null;
  const conditionLabel = listing.condition ? sell?.conditionOptions?.[listing.condition] ?? listing.condition : null;

  useEffect(() => {
    setImageSrc(listing.imageUrl || PLACEHOLDER_IMAGE);
  }, [listing.imageUrl]);

  const handleImageError = () => {
    setImageSrc(PLACEHOLDER_IMAGE);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-6 sm:px-6">
      <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-lg">
        <Image
          src={imageSrc}
          alt={listing.title}
          fill
          className="h-full w-full object-cover"
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          onError={handleImageError}
        />
      </div>
      <div className="flex flex-col gap-6 rounded-3xl bg-white/80 p-8 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold text-deep-blue">{listing.title}</h1>
          <span className="rounded-full bg-coral/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-coral">
            {'$' + Number(listing.price).toLocaleString('en-US')}
          </span>
        </div>
        <p className="text-base leading-relaxed text-deep-blue/80">{listing.description}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailStat label={listings.detail.brand} value={listing.brand} />
          <DetailStat label={listings.detail.model} value={listing.model} />
          <DetailStat label={listings.detail.year} value={listing.year ? String(listing.year) : null} />
          <DetailStat label={listings.detail.condition} value={conditionLabel} />
          <DetailStat label={listings.detail.location} value={listing.location} />
          <DetailStat label={listings.detail.category} value={categoryLabel} />
        </div>
      </div>
      <ListingReportButton listingId={listing.id} />
    </div>
  );
}

function DetailStat({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-sand/40 px-4 py-3 text-sm text-deep-blue">
      <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-deep-blue/60">{label}</span>
      <span className="mt-1 block text-base font-semibold">{value}</span>
    </div>
  );
}
