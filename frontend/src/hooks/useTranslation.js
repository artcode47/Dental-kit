import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '../i18n';

export const useTranslation = (ns, options) => {
  const [isReady, setIsReady] = useState(false);
  const translation = useI18nTranslation(ns, options);

  useEffect(() => {
    const checkReady = () => {
      if (i18n.isInitialized) {
        setIsReady(true);
      } else {
        // Wait for i18n to be ready
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  }, []);

  // Return a safe translation function that handles missing keys gracefully
  const safeT = (key, options) => {
    if (!isReady) {
      return key; // Return the key itself while loading
    }
    
    const result = translation.t(key, options);
    
    // If the result is the same as the key, it means the translation is missing
    if (result === key) {
      console.warn(`Missing translation key: ${key}`);
      return key; // Return the key as fallback
    }
    
    return result;
  };

  return {
    ...translation,
    t: safeT,
    isReady
  };
}; 