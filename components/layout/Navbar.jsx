'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import useScrollDirection from '@/hooks/useScrollDirection';
import { useLanguage } from '@/context/LanguageContext';
import useTranslations from '@/hooks/useTranslations';

export default function Navbar() {
  const scrollDirection = useScrollDirection();
  const pathname = usePathname();
  const { toggleLanguage, language } = useLanguage();
  const { navbar } = useTranslations();
  const navLinks = navbar.links;
  const toggleAriaLabel = language === 'es' ? navbar.languageToggle.toEn : navbar.languageToggle.toEs;

  return (
    <motion.nav
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: scrollDirection === 'down' ? -100 : 0, opacity: scrollDirection === 'down' ? 0 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur-md shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-heading uppercase tracking-[0.3em] text-deep-blue">
          Kito
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`transition-colors duration-300 ${
                pathname === link.to ? 'text-coral' : 'text-deep-blue hover:text-coral'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sell"
            className="gradient-button rounded-full px-5 py-2 text-xs font-semibold uppercase text-white shadow-coral"
          >
            {navbar.listButton}
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={toggleAriaLabel}
            className="flex items-center gap-2 rounded-full border border-coral/30 px-4 py-2 text-xs font-semibold uppercase text-deep-blue transition-colors duration-300 hover:border-coral hover:text-coral"
          >
            <span aria-hidden="true" className="text-lg">
              {navbar.languageToggle.flag}
            </span>
            <span>{navbar.languageToggle.code}</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
