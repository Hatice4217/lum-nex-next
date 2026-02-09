// LUMINEX Next.js - Language Provider
// Turkish / English language switching

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, t as getTranslation } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr');
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage
  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem('language') as Language | null;
    const browserLang = navigator.language.startsWith('tr') ? 'tr' : 'en';
    const initialLang = storedLang || browserLang;
    setLanguageState(initialLang);
    localStorage.setItem('language', initialLang);
    document.documentElement.lang = initialLang;
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.lang = newLang;
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
