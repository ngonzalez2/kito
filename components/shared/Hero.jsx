'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import useTranslations from '@/hooks/useTranslations';

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 80]);
  const { hero } = useTranslations();

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <motion.div
        style={{ y }}
        className="hero-gradient absolute inset-0"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-heading text-3xl uppercase tracking-[0.4em] sm:text-4xl md:text-5xl"
        >
          {hero.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="max-w-xl text-base font-light sm:text-lg"
        >
          {hero.subtitle}
        </motion.p>
        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Link
            href="/listings"
            className="gradient-button rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-coral"
          >
            {hero.primaryCta}
          </Link>
          <a
            href="#list-your-kite"
            className="rounded-full border border-white/60 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            {hero.secondaryCta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
