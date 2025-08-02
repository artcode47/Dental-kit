import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'language',
      lookupCookie: 'language',
    },
    
    react: {
      useSuspense: false,
    },
    
    // RTL support
    dir: (lng) => {
      return lng === 'ar' ? 'rtl' : 'ltr';
    },
    
    // Plural rules
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Key separator
    keySeparator: '.',
    nsSeparator: ':',
    
    // Default namespace
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
    
    // Parse missing key handler
    parseMissingKeyHandler: (key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`);
      }
      return key;
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false,
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'language',
      lookupCookie: 'language',
      lookupQuerystring: 'lng',
      lookupSessionStorage: 'language',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      
      // Check for language in URL path
      checkWhitelist: true,
    },
    
    // Whitelist supported languages
    whitelist: ['en', 'ar'],
    
    // Non-explicit keys for fallback
    nonExplicitWhitelist: true,
    
    // Load language files
    load: 'languageOnly',
    
    // Preload languages
    preload: ['en', 'ar'],
    
    // Language change event
    react: {
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      nsMode: 'default',
      useSuspense: false,
    },
  });

// Helper functions
export const changeLanguage = (lng) => {
  return i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const getSupportedLanguages = () => {
  return ['en', 'ar'];
};

export const isRTL = (lng = i18n.language) => {
  return lng === 'ar';
};

export const getDirection = (lng = i18n.language) => {
  return isRTL(lng) ? 'rtl' : 'ltr';
};

export const formatNumber = (number, options = {}) => {
  const lng = i18n.language;
  const defaultOptions = {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };
  
  return new Intl.NumberFormat(lng === 'ar' ? 'ar-SA' : 'en-US', {
    ...defaultOptions,
    ...options,
  }).format(number);
};

export const formatCurrency = (amount, currency = null) => {
  const lng = i18n.language;
  const defaultCurrency = lng === 'ar' ? 'SAR' : 'USD';
  
  return new Intl.NumberFormat(lng === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency || defaultCurrency,
  }).format(amount);
};

export const formatDate = (date, options = {}) => {
  const lng = i18n.language;
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat(lng === 'ar' ? 'ar-SA' : 'en-US', {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
};

export const formatTime = (date, options = {}) => {
  const lng = i18n.language;
  const defaultOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: lng === 'ar' ? false : true,
  };
  
  return new Intl.DateTimeFormat(lng === 'ar' ? 'ar-SA' : 'en-US', {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  const lng = i18n.language;
  const rtf = new Intl.RelativeTimeFormat(lng === 'ar' ? 'ar' : 'en', {
    numeric: 'auto',
  });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
};

export default i18n; 