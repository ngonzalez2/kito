import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import listingsData from '../../data/listings.json';
import ListingCard from '../components/ListingCard.jsx';
import PageTransition from '../components/PageTransition.jsx';
import useTranslations from '../hooks/useTranslations.js';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = useMemo(() => listingsData.find((item) => String(item.id) === id), [id]);
  const [imageIndex, setImageIndex] = useState(0);
  const { listingDetail, listingCard } = useTranslations();

  if (!listing) {
    return (
      <PageTransition>
        <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
          <p className="text-lg text-deep-blue/70">{listingDetail.notFound}</p>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="gradient-button rounded-full px-6 py-2 text-sm font-semibold uppercase text-white"
          >
            {listingDetail.back}
          </button>
        </section>
      </PageTransition>
    );
  }

  const gallery = [listing.image, listing.image];
  const similar = listingsData.filter((item) => item.id !== listing.id).slice(0, 3);
  const formattedCondition = listingCard.conditionLabels[listing.condition] || listing.condition;
  const formattedPrice = listing.price.toLocaleString(listingCard.currency);

  const nextImage = () => setImageIndex((index) => (index + 1) % gallery.length);
  const prevImage = () => setImageIndex((index) => (index - 1 + gallery.length) % gallery.length);

  return (
    <PageTransition>
      <section className="bg-gradient-to-b from-white via-sky/20 to-white py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={gallery[imageIndex] + imageIndex}
                    src={gallery[imageIndex]}
                    alt={listing.title}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5 }}
                    className="h-[320px] w-full object-cover sm:h-[420px]"
                  />
                </AnimatePresence>
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    type="button"
                    onClick={prevImage}
                    className="m-4 rounded-full bg-white/70 p-3 text-deep-blue shadow-lg"
                  >
                    ‹
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={nextImage}
                    className="m-4 rounded-full bg-white/70 p-3 text-deep-blue shadow-lg"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-coral">{formattedCondition}</span>
                <h1 className="mt-4 font-heading text-3xl uppercase tracking-[0.3em] text-deep-blue">{listing.title}</h1>
              </div>
              <p className="text-3xl font-semibold text-deep-blue">
                $ {formattedPrice}
              </p>
              <div className="grid gap-2 text-sm text-deep-blue/80">
                <span>
                  {listingDetail.location}: {listing.location}
                </span>
                <span>
                  {listingDetail.brand}: {listing.brand || 'Duotone'}
                </span>
              </div>
              <p className="text-sm text-deep-blue/70">
                {listingDetail.description}
              </p>
              <a
                href="https://wa.me/573001112233"
                className="gradient-button inline-flex w-fit items-center justify-center rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-coral"
              >
                {listingDetail.chat}
              </a>
              {/* Backend hook: Replace the anchor above with a button that triggers your preferred backend integration (Firebase, Supabase or Sharetribe) once APIs are ready. */}
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="font-heading text-2xl uppercase tracking-[0.3em] text-deep-blue">{listingDetail.similar}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
