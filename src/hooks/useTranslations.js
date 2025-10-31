import translations from '../i18n/translations.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function useTranslations() {
  const { language } = useLanguage();
  return translations[language] ?? translations.es;
}
