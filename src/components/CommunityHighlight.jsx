import { motion } from 'framer-motion';

const spots = ['Mayapo', 'Cabo de la Vela', 'Santa Verónica'];

export default function CommunityHighlight() {
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
          Trusted by riders in {spots.join(', ')}
        </motion.h2>
        <motion.p
          className="max-w-2xl text-base font-light"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Conecta con vendedores verificados y encuentra equipo listo para navegar las mejores olas de
          Colombia. La comunidad Kito mantiene historias, spots y equipos girando como el viento.
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
              <p className="mt-3 text-sm font-light">
                Historias de viento, riders locales y equipos con confianza garantizada.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
