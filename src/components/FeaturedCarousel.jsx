import { useMemo } from 'react';
import { motion } from 'framer-motion';
import listings from '../../data/listings.json';
import ListingCard from './ListingCard.jsx';

export default function FeaturedCarousel() {
  const featured = useMemo(() => listings.slice(0, 6), []);

  return (
    <section id="featured" className="bg-gradient-to-b from-white via-sky/15 to-white py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <div className="flex flex-col items-start gap-4 text-left text-deep-blue">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-coral">Destacados</span>
          <h2 className="font-heading text-3xl uppercase tracking-[0.3em]">Explora el viento</h2>
          <p className="max-w-2xl text-base text-deep-blue/80">
            Equipo curado por la comunidad Kito. Kites, tablas y accesorios listos para tu próxima sesión.
          </p>
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
          {featured.map((item) => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}>
              <ListingCard listing={item} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
