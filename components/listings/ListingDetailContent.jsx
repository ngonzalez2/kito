'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ListingReportButton from './ListingReportButton';
import useTranslations from '@/hooks/useTranslations';
import { DEFAULT_LISTING_IMAGE_URL } from '@/lib/constants';

export default function ListingDetailContent({
  listing,
  images = [],
  previousListing = null,
  nextListing = null,
}) {
  const { listings, sell } = useTranslations();
  const categoryLabel = listing.category ? listings.categories?.[listing.category] ?? listing.category : null;
  const conditionLabel = listing.condition ? sell?.conditionOptions?.[listing.condition] ?? listing.condition : null;
  const normalizedImages = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) {
      return images.map((image, index) => ({
        id: image.id ?? index,
        url: image.imageUrl,
        isPrimary: Boolean(image.isPrimary),
      }));
    }
    const fallbackUrl = listing.imageUrl || DEFAULT_LISTING_IMAGE_URL;
    return [
      {
        id: 'fallback',
        url: fallbackUrl,
        isPrimary: true,
      },
    ];
  }, [images, listing.imageUrl]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-6 sm:px-6">
      <div className="flex w-full flex-wrap items-center justify-center gap-4 md:flex-nowrap md:justify-between">
        {previousListing && (
          <ListingNavigationLink
            href={`/listings/${previousListing.id}`}
            direction="previous"
            label={listings.detail.previous}
            listingTitle={previousListing.title}
          />
        )}
        <ListingImageCarousel
          title={listing.title}
          images={normalizedImages}
          navigation={listings.detail?.imageNavigation}
        />
        {nextListing && (
          <ListingNavigationLink
            href={`/listings/${nextListing.id}`}
            direction="next"
            label={listings.detail.next}
            listingTitle={nextListing.title}
          />
        )}
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

function ListingImageCarousel({ title, images, navigation = {} }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedImages = images && images.length > 0 ? images : [{ id: 'fallback', url: DEFAULT_LISTING_IMAGE_URL, isPrimary: true }];
  const previousLabel = navigation.previous ?? 'Previous image';
  const nextLabel = navigation.next ?? 'Next image';
  const goToTemplate = navigation.goTo ?? 'View image {index}';

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const clampedIndex = Math.min(Math.max(activeIndex, 0), normalizedImages.length - 1);
  const current = normalizedImages[clampedIndex];

  const goToIndex = (nextIndex) => {
    if (normalizedImages.length <= 1) {
      return;
    }
    setActiveIndex(nextIndex);
  };

  const step = (direction) => {
    if (normalizedImages.length <= 1) {
      return;
    }
    setActiveIndex((prev) => {
      const next = (prev + direction + normalizedImages.length) % normalizedImages.length;
      return next;
    });
  };

  return (
    <div className="relative flex-1">
      <div className="relative h-[420px] w-full overflow-hidden rounded-3xl shadow-lg">
        <Image
          key={current.id}
          src={current.url}
          alt={`${title} image ${clampedIndex + 1}`}
          fill
          className="h-full w-full object-cover"
          priority={clampedIndex === 0}
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
        {normalizedImages.length > 1 && (
          <span className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white">
            {clampedIndex + 1} / {normalizedImages.length}
          </span>
        )}
      </div>
      {normalizedImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-deep-blue shadow transition hover:bg-white hover:text-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
            aria-label={previousLabel}
          >
            <ArrowIcon className="h-5 w-5 -scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-deep-blue shadow transition hover:bg-white hover:text-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
            aria-label={nextLabel}
          >
            <ArrowIcon className="h-5 w-5" />
          </button>
        </>
      )}
      {normalizedImages.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {normalizedImages.map((image, index) => {
            const isActive = index === clampedIndex;
            const goToLabel = goToTemplate.replace('{index}', String(index + 1));
            return (
              <button
                key={image.id ?? index}
                type="button"
                onClick={() => goToIndex(index)}
                className="group h-3 w-3 rounded-full border border-white/60 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                aria-label={goToLabel}
              >
                <span
                  className={`block h-full w-full rounded-full ${
                    isActive ? 'bg-coral' : 'bg-white/70 group-hover:bg-white'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
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

function ListingNavigationLink({ href, direction, label, listingTitle }) {
  const isPrevious = direction === 'previous';
  const rotationClass = isPrevious ? '-scale-x-100' : '';
  const hoverTranslationClass = isPrevious ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5';
  const accessibleLabel = listingTitle ? `${label}: ${listingTitle}` : label;

  return (
    <Link
      href={href}
      className={`group flex h-12 w-12 shrink-0 items-center justify-center self-center rounded-full bg-white/80 text-deep-blue shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral`}
      aria-label={accessibleLabel}
      title={accessibleLabel}
    >
      <span className="sr-only">{accessibleLabel}</span>
      <ArrowIcon className={`h-6 w-6 translate-x-0 transition-transform ${hoverTranslationClass} ${rotationClass}`} />
    </Link>
  );
}

function ArrowIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 12h15" />
      <path d="M14.5 6.5 20 12l-5.5 5.5" />
    </svg>
  );
}
