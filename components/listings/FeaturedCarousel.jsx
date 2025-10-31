'use client';

import { motion } from 'framer-motion';
import ListingCard from './ListingCard';
import useTranslations from '@/hooks/useTranslations';

export default function FeaturedCarousel({ listings }) {
  const { featured: featuredCopy } = useTranslations();

  if (!listings?.length) {
    return null;
  }

  return (
    <section id="featured" className="bg-gradient-to-b from-white via-sky/15 to-white py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <div className="flex flex-col items-start gap-4 text-left text-deep-blue">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-coral">{featuredCopy.tag}</span>
          <h2 className="font-heading text-3xl uppercase tracking-[0.3em]">{featuredCopy.heading}</h2>
          <p className="max-w-2xl text-base text-deep-blue/80">{featuredCopy.description}</p>
        </div>
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.1, when: 'beforeChildren' },
            },
          }}
        >
          {listings.map((item) => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}>
              <ListingCard listing={item} layout="vertical" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
