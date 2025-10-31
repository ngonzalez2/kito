'use client';

import translations from '@/i18n/translations';
import { useLanguage } from '@/context/LanguageContext';

export default function useTranslations() {
  const { language } = useLanguage();
  return translations[language] ?? translations.es;
}
