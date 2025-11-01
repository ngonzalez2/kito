import ListingDetailContent from '@/components/listings/ListingDetailContent';
import ListingsEmptyState from '@/components/listings/ListingsEmptyState';
import { getListingById } from '@/lib/listings';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }) {
  const rawId = params?.id ?? '';
  const id = rawId.split('-')[0];
  const listing = id ? await getListingById(id) : null;
  if (!listing || listing.status !== 'approved') {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6">
        <ListingsEmptyState />
      </div>
    );
  }

  return <ListingDetailContent listing={listing} />;
}
