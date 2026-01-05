'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { t, Locale } from '@/lib/i18n';

interface TranslationContextType {
  t: (key: string) => string;
  locale: Locale;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const { language: clientLanguage } = useSettings();

  // Use client language if available, otherwise fall back to server-detected locale
  const language: Locale = clientLanguage || initialLocale || 'en';

  const translate = (key: string) => t(language, key);

  return (
    <TranslationContext.Provider value={{ t: translate, locale: language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return ctx;
}