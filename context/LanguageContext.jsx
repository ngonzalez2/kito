'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'es';
    }
    return window.localStorage.getItem('kito-language') || 'es';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('kito-language', language);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === 'es' ? 'en' : 'es')),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
