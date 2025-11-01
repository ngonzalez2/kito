import Hero from '@/components/shared/Hero';
import FeaturedCarousel from '@/components/listings/FeaturedCarousel';
import ListYourKiteSection from '@/components/shared/ListYourKiteSection';
import CommunityHighlight from '@/components/shared/CommunityHighlight';
import { getApprovedListings } from '@/lib/listings';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // ✅ Always pass defined filters
  const filters = {
    category: null,
    condition: null,
    location: null,
    brand: null,
    model: null,
    year: null,
  };

  let listings = [];
  try {
    listings = await getApprovedListings(filters);
  } catch (error) {
    console.error('[HomePage] Failed to fetch listings:', error);
  }

  const featured = listings.slice(0, 6);

  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      <FeaturedCarousel listings={featured} />
      <ListYourKiteSection />
      <CommunityHighlight />
    </div>
  );
}
