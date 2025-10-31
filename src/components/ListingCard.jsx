import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useTranslations from '../hooks/useTranslations.js';

export default function ListingCard({ listing }) {
  const { listingCard } = useTranslations();
  const formattedCondition = listingCard.conditionLabels[listing.condition] || listing.condition;
  const formattedPrice = listing.price.toLocaleString(listingCard.currency);

  return (
    <motion.div
      whileHover={{ y: -10, boxShadow: '0 20px 45px rgba(242, 106, 75, 0.25)' }}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-lg transition-shadow"
    >
      <Link to={`/listings/${listing.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase text-deep-blue">
            {formattedCondition}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-heading text-lg uppercase tracking-[0.2em] text-deep-blue">
            {listing.title}
          </h3>
          <p className="text-sm text-deep-blue/70">{listing.location}</p>
          <div className="mt-auto flex items-center justify-between text-sm">
            <span className="text-2xl font-semibold text-deep-blue">
              $ {formattedPrice}
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-coral">{listingCard.viewDetails}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
