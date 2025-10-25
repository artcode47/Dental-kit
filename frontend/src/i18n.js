import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import adminEnTranslations from './locales/admin-en.json';
import adminArTranslations from './locales/admin-ar.json';
import authEnTranslations from './locales/auth-en.json';
import authArTranslations from './locales/auth-ar.json';
import ecommerceEnTranslations from './locales/ecommerce-en.json';
import ecommerceArTranslations from './locales/ecommerce-ar.json';
import commonEnTranslations from './locales/common-en.json';
import commonArTranslations from './locales/common-ar.json';

// Some locale files (like auth-*.json) are wrapped under a top-level "auth" key.
// Normalize resources so the namespace points to the inner object when present.
const resources = {
  en: {
    admin: adminEnTranslations?.admin || adminEnTranslations,
    auth: authEnTranslations?.auth || authEnTranslations,
    ecommerce: ecommerceEnTranslations,
    common: commonEnTranslations
  },
  ar: {
    admin: adminArTranslations?.admin || adminArTranslations,
    auth: authArTranslations?.auth || authArTranslations,
    ecommerce: ecommerceArTranslations,
    common: commonArTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
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
    defaultNS: 'ecommerce',
    ns: ['admin', 'auth', 'ecommerce', 'common'],
    
    // Missing key handling
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${key} for language: ${lng} in namespace: ${ns}`);
      }
    },
    
    // Parse missing key handler
    parseMissingKeyHandler: (key) => {
      if (import.meta.env.DEV) {
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