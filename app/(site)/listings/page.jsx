import ListingsHeader from '@/components/listings/ListingsHeader';
import FilterBar from '@/components/listings/FilterBar';
import ListingCard from '@/components/listings/ListingCard';
import ListingsEmptyState from '@/components/listings/ListingsEmptyState';
import { getApprovedListings } from '@/lib/listings';

export const dynamic = 'force-dynamic';

export default async function ListingsPage({ searchParams }) {
  const parsedYear = searchParams?.year ? Number(searchParams.year) : null;
  const filters = {
    category: searchParams?.category || null,
    condition: searchParams?.condition || null,
    location: searchParams?.location || null,
    brand: searchParams?.brand || null,
    model: searchParams?.model || null,
    year: Number.isFinite(parsedYear) ? parsedYear : null,
  };
  const listings = await getApprovedListings(filters);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-6 sm:px-6">
      <ListingsHeader total={listings.length} />
      <FilterBar initialFilters={filters} />
      {listings.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showReport />
          ))}
        </div>
      ) : (
        <ListingsEmptyState />
      )}
    </div>
  );
}
