import en from './locales/en/common';

// In a real application, you would integrate `i18next` and `react-i18next`.
// This configuration structure prepares the application for dynamic imports and fallbacks.

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' }
];

export const resources = {
  en: { translation: en },
  // Stubs for other languages:
  hi: { translation: {} },
  te: { translation: {} },
  ta: { translation: {} },
  kn: { translation: {} },
  ml: { translation: {} },
  mr: { translation: {} },
  bn: { translation: {} },
  gu: { translation: {} },
  pa: { translation: {} },
};

// Fallback behavior: if a key is missing in 'hi', it falls back to 'en'.
export const DEFAULT_LANGUAGE = 'en';

/**
 * Mock function to simulate a translation hook.
 * A complete implementation would export `useTranslation` from 'react-i18next'.
 */
export const getTranslation = (key: string, lang: string = DEFAULT_LANGUAGE): string => {
  const dictionary = (resources as any)[lang]?.translation || resources[DEFAULT_LANGUAGE].translation;
  
  const keys = key.split('.');
  let current: any = dictionary;
  
  for (const k of keys) {
    if (current[k] === undefined) {
      // Fallback to English
      current = resources[DEFAULT_LANGUAGE].translation;
      for (const fallbackKey of keys) {
        if (current && current[fallbackKey] !== undefined) {
          current = current[fallbackKey];
        } else {
          return key; // return key if completely missing
        }
      }
      return typeof current === 'string' ? current : key;
    }
    current = current[k];
  }
  
  return typeof current === 'string' ? current : key;
};
