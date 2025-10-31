import Hero from '../components/Hero.jsx';
import FeaturedCarousel from '../components/FeaturedCarousel.jsx';
import CommunityHighlight from '../components/CommunityHighlight.jsx';
import PageTransition from '../components/PageTransition.jsx';

export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <FeaturedCarousel />
      <section
        id="list-your-kite"
        className="relative bg-white py-16"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-coral">Publica tu equipo</span>
            <h2 className="font-heading text-3xl uppercase tracking-[0.3em] text-deep-blue">
              Mantén el viento en movimiento
            </h2>
            <p className="text-base text-deep-blue/80">
              Conecta con riders verificados. Publica tu kite, tabla o accesorios en minutos y deja
              que la comunidad Kito se encargue del resto.
            </p>
            <ul className="space-y-3 text-sm text-deep-blue/80">
              <li>• Fotografías nítidas y descripciones honestas.</li>
              <li>• Filtros para compradores que buscan exactamente tu equipo.</li>
              <li>
                • Integración futura con plataformas como Firebase, Supabase o Sharetribe para pagos
                y verificación (ver comentario en ListingDetailPage).
              </li>
            </ul>
            <a
              href="https://wa.me/573001112233"
              className="gradient-button inline-flex w-fit items-center justify-center rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-coral"
            >
              Empieza ahora
            </a>
          </div>
          <div className="rounded-3xl bg-coastal-gradient p-10 text-white shadow-xl">
            <h3 className="font-heading text-2xl uppercase tracking-[0.3em]">¿Por qué Kito?</h3>
            <p className="mt-4 text-sm font-light">
              Diseñado por kitesurfers para kitesurfers. Transparencia, confianza y comunidad son la
              base del mercado. Prepárate para tus próximas sesiones con equipos revisados y
              historias compartidas.
            </p>
          </div>
        </div>
      </section>
      <CommunityHighlight />
    </PageTransition>
  );
}
