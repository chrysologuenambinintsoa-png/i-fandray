import fr from '@/config/locales/fr.json';
import en from '@/config/locales/en.json';
import mg from '@/config/locales/mg.json';
import de from '@/config/locales/de.json';
import es from '@/config/locales/es.json';
import ch from '@/config/locales/ch.json';

export type Locale = 'fr' | 'en' | 'mg' | 'de' | 'es' | 'ch';

export const translations = {
  fr,
  en,
  mg,
  de,
  es,
  ch,
};

export type TranslationKey = typeof translations[Locale];

export function getTranslation(locale: Locale): TranslationKey {
  return translations[locale] || translations.en;
}

export function t(locale: Locale, key: string): string {
  const translation = getTranslation(locale);
  const keys = key.split('.');
  let value: any = translation;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key} for locale: ${locale}`);
      return key;
    }
  }
  
  return value as string;
}

export const availableLocales: Locale[] = ['fr', 'en', 'mg', 'de', 'es', 'ch'];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  mg: 'Malagasy',
  de: 'Deutsch',
  es: 'Español',
  ch: '中文',
};