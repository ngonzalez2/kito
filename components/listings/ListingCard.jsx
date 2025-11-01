'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useTranslations from '@/hooks/useTranslations';
import ListingReportButton from './ListingReportButton';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

export default function ListingCard({ listing, layout = 'vertical', showStatusTag = false, showReport = false }) {
  const { listings: listingsCopy, sell } = useTranslations();
  const imageUrl = listing.imageUrl || FALLBACK_IMAGE;
  const isHorizontal = layout === 'horizontal';
  const categoryLabel = listing.category ? listingsCopy.categories?.[listing.category] ?? listing.category : null;
  const conditionLabel = listing.condition ? sell?.conditionOptions?.[listing.condition] ?? listing.condition : null;
  const brandModelYear = [listing.brand, listing.model].filter(Boolean).join(' ');
  const hasYear = Boolean(listing.year);

  return (
    <motion.article
      className={`flex overflow-hidden rounded-3xl bg-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-coral ${
        isHorizontal ? 'flex-row' : 'flex-col'
      }`}
      whileHover={{ scale: 1.01 }}
    >
      <Link href={`/listings/${listing.id}`} className={isHorizontal ? 'relative w-48 flex-shrink-0' : 'relative h-60 w-full'}>
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          sizes={isHorizontal ? '200px' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
          className="h-full w-full object-cover"
          priority={false}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/listings/${listing.id}`} className="text-lg font-semibold text-deep-blue">
            {listing.title}
          </Link>
          <span className="whitespace-nowrap rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-coral">
            {'$' + Number(listing.price).toLocaleString('en-US')}
          </span>
        </div>
        {(brandModelYear || hasYear) && (
          <p className="text-sm text-gray-500">
            {brandModelYear}
            {brandModelYear && hasYear ? ' — ' : ''}
            {hasYear ? listing.year : ''}
          </p>
        )}
        <p className="text-sm text-deep-blue/70 line-clamp-3">{listing.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-deep-blue/60">
          {categoryLabel && <span className="rounded-full bg-sand/40 px-3 py-1 text-deep-blue">{categoryLabel}</span>}
          {conditionLabel && <span className="rounded-full bg-sky/40 px-3 py-1 text-deep-blue">{conditionLabel}</span>}
          {listing.location && <span className="rounded-full bg-aqua/30 px-3 py-1 text-deep-blue">{listing.location}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-4">
          <Link href={`/listings/${listing.id}`} className="text-sm font-semibold text-aqua hover:text-coral">
            {listingsCopy.viewDetails}
          </Link>
          {showStatusTag && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                listing.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : listing.status === 'rejected'
                  ? 'bg-red-500/10 text-red-600'
                  : 'bg-yellow-500/10 text-yellow-600'
              }`}
            >
              {listingsCopy.status[listing.status] ?? listing.status}
            </span>
          )}
        </div>
        {showReport && <ListingReportButton listingId={listing.id} />}
      </div>
    </motion.article>
  );
}
