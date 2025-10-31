import { useMemo, useState } from 'react';
import listingsData from '../../data/listings.json';
import ListingCard from '../components/ListingCard.jsx';
import FilterBar from '../components/FilterBar.jsx';
import PageTransition from '../components/PageTransition.jsx';

const priceMatcher = {
  '< $3M': (price) => price < 3000000,
  '$3M - $6M': (price) => price >= 3000000 && price <= 6000000,
  '$6M+': (price) => price > 6000000,
};

export default function Listings() {
  const [filters, setFilters] = useState({});

  const filteredListings = useMemo(() => {
    return listingsData.filter((listing) => {
      if (filters.category && listing.category !== filters.category) return false;
      if (filters.condition && listing.condition !== filters.condition) return false;
      if (filters.location && listing.location !== filters.location) return false;
      if (filters.price) {
        const matcher = priceMatcher[filters.price];
        if (matcher && !matcher(listing.price)) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <PageTransition>
      <section className="bg-gradient-to-b from-sky/30 via-white to-white py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-coral">Marketplace</span>
            <h1 className="font-heading text-3xl uppercase tracking-[0.3em] text-deep-blue">
              Encuentra tu próximo kite
            </h1>
            <p className="max-w-2xl text-base text-deep-blue/80">
              Filtros personalizables para descubrir equipo perfecto según tus condiciones y spots favoritos.
            </p>
          </div>
          <FilterBar onFilter={setFilters} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
