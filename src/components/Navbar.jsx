import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useScrollDirection from '../hooks/useScrollDirection.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import useTranslations from '../hooks/useTranslations.js';

export default function Navbar() {
  const scrollDirection = useScrollDirection();
  const location = useLocation();
  const { toggleLanguage, language } = useLanguage();
  const { navbar } = useTranslations();
  const navLinks = navbar.links;
  const toggleAriaLabel = language === 'es' ? navbar.languageToggle.toEn : navbar.languageToggle.toEs;

  return (
    <motion.nav
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: scrollDirection === 'down' ? -100 : 0,
        opacity: scrollDirection === 'down' ? 0 : 1,
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-white/70 shadow-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-heading tracking-[0.3em] uppercase text-deep-blue">
          Kito
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors duration-300 ${
                location.pathname === link.to ? 'text-coral' : 'text-deep-blue hover:text-coral'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="#list-your-kite"
            className="gradient-button rounded-full px-5 py-2 text-xs font-semibold uppercase text-white shadow-coral"
          >
            {navbar.listButton}
          </a>
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
