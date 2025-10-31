'use client';

import useTranslations from '@/hooks/useTranslations';

export default function ListYourKiteSection() {
  const { home } = useTranslations();
  const listSection = home.listSection;

  return (
    <section id="list-your-kite" className="relative bg-white py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-coral">{listSection.tag}</span>
          <h2 className="font-heading text-3xl uppercase tracking-[0.3em] text-deep-blue">{listSection.heading}</h2>
          <p className="text-base text-deep-blue/80">{listSection.description}</p>
          <ul className="space-y-3 text-sm text-deep-blue/80">
            {listSection.bullets.map((bullet) => (
              <li key={bullet}>• {bullet}</li>
            ))}
          </ul>
          <a
            href="https://wa.me/573001112233"
            className="gradient-button inline-flex w-fit items-center justify-center rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-coral"
          >
            {listSection.button}
          </a>
        </div>
        <div className="rounded-3xl bg-coastal-gradient p-10 text-white shadow-xl">
          <h3 className="font-heading text-2xl uppercase tracking-[0.3em]">{listSection.cardTitle}</h3>
          <p className="mt-4 text-sm font-light">{listSection.cardDescription}</p>
        </div>
      </div>
    </section>
  );
}
