import { motion } from 'framer-motion';
import useTranslations from '../hooks/useTranslations.js';

const spots = ['Mayapo', 'Cabo de la Vela', 'Santa Verónica'];

export default function CommunityHighlight() {
  const { community } = useTranslations();
  const heading = community.heading.replace('{spots}', spots.join(', '));

  return (
    <section className="relative overflow-hidden bg-coastal-gradient py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <motion.h2
          className="max-w-3xl font-heading text-3xl uppercase tracking-[0.4em]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {heading}
        </motion.h2>
        <motion.p
          className="max-w-2xl text-base font-light"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {community.description}
        </motion.p>
        <div className="grid gap-6 md:grid-cols-3">
          {spots.map((spot) => (
            <motion.div
              key={spot}
              className="rounded-3xl bg-white/10 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="font-heading text-xl uppercase tracking-[0.3em]">{spot}</h3>
              <p className="mt-3 text-sm font-light">{community.cardDescription}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
