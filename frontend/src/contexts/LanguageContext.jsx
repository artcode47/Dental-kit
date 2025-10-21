import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import Cookies from 'js-cookie';
import { getParam, syncParam } from '../utils/urlBuilder';

const LanguageContext = createContext();

const languages = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    currency: 'USD',
    currencySymbol: '$',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    }
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      precision: 2
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Initialize language (from URL > cookie > browser)
  useEffect(() => {
    const urlLang = getParam('lang');
    const savedLanguage = Cookies.get('language');
    const browserLanguage = navigator.language.split('-')[0];
    
    // Determine initial language
    let initialLanguage = 'en';
    
    if (urlLang && languages[urlLang]) {
      initialLanguage = urlLang;
    } else if (savedLanguage && languages[savedLanguage]) {
      initialLanguage = savedLanguage;
    } else if (languages[browserLanguage]) {
      initialLanguage = browserLanguage;
    }
    
    setLanguage(initialLanguage);
  }, []);

  // Apply language changes
  useEffect(() => {
    if (currentLanguage) {
      // Avoid URL param mutations that can cause reloads or repaints on mobile
      // syncParam('lang', currentLanguage);
      // Change i18n language
      i18n.changeLanguage(currentLanguage);
      
      // Apply RTL/LTR
      const isRTLDirection = languages[currentLanguage].direction === 'rtl';
      setIsRTL(isRTLDirection);
      
      // Update document direction
      document.documentElement.dir = languages[currentLanguage].direction;
      document.documentElement.lang = currentLanguage;
      
      // Keep body classes stable to avoid CLS on mobile
      document.body.className = document.body.className.replace(/lang-\w+/g, '');
      document.body.classList.add(`lang-${currentLanguage}`);
      
      if (isRTLDirection) {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
      
      // Update meta tags
      const metaLang = document.querySelector('meta[name="language"]');
      if (metaLang) {
        metaLang.setAttribute('content', currentLanguage);
      }
      
      const metaDir = document.querySelector('meta[name="direction"]');
      if (metaDir) {
        metaDir.setAttribute('content', languages[currentLanguage].direction);
      }
    }
  }, [currentLanguage]);

  const setLanguage = (languageCode) => {
    if (!languages[languageCode]) {
      console.error(`Language "${languageCode}" not supported`);
      return;
    }
    
    setCurrentLanguage(languageCode);
    Cookies.set('language', languageCode, { expires: 365 });
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  const getCurrentLanguage = () => {
    return languages[currentLanguage];
  };

  const getSupportedLanguages = () => {
    return Object.values(languages);
  };

  const formatDate = (date, format = null) => {
    const dateObj = new Date(date);
    const languageConfig = languages[currentLanguage];
    const dateFormat = format || languageConfig.dateFormat;
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString(currentLanguage, options);
  };

  const formatTime = (date, format = null) => {
    const dateObj = new Date(date);
    const languageConfig = languages[currentLanguage];
    const timeFormat = format || languageConfig.timeFormat;
    
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12'
    };
    
    return dateObj.toLocaleTimeString(currentLanguage, options);
  };

  const formatNumber = (number, options = {}) => {
    const languageConfig = languages[currentLanguage];
    const { decimal, thousands, precision } = languageConfig.numberFormat;
    
    const defaultOptions = {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
      useGrouping: true
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return number.toLocaleString(currentLanguage, mergedOptions);
  };

  const formatCurrency = (amount, currency = null) => {
    const languageConfig = languages[currentLanguage];
    const currencyCode = currency || languageConfig.currency;
    const currencySymbol = languageConfig.currencySymbol;
    
    const formattedNumber = formatNumber(amount);
    
    if (isRTL) {
      return `${formattedNumber} ${currencySymbol}`;
    } else {
      return `${currencySymbol}${formattedNumber}`;
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Basic phone number formatting based on language
    if (currentLanguage === 'ar') {
      // Arabic phone number format
      return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
      // English phone number format
      return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
  };

  const getTextDirection = () => {
    return languages[currentLanguage].direction;
  };

  const isRTLDirection = () => {
    return isRTL;
  };

  const getOppositeDirection = () => {
    return isRTL ? 'ltr' : 'rtl';
  };

  const getAlignment = (defaultAlignment = 'left') => {
    if (isRTL) {
      return defaultAlignment === 'left' ? 'right' : 'left';
    }
    return defaultAlignment;
  };

  const getMarginDirection = (side) => {
    if (isRTL) {
      const rtlMap = {
        left: 'right',
        right: 'left',
        start: 'end',
        end: 'start'
      };
      return rtlMap[side] || side;
    }
    return side;
  };

  const getPaddingDirection = (side) => {
    return getMarginDirection(side);
  };

  const getBorderDirection = (side) => {
    return getMarginDirection(side);
  };

  const getFlexDirection = (direction) => {
    if (isRTL) {
      const rtlMap = {
        row: 'row-reverse',
        'row-reverse': 'row',
        column: 'column',
        'column-reverse': 'column-reverse'
      };
      return rtlMap[direction] || direction;
    }
    return direction;
  };

  const getTransformDirection = (direction) => {
    if (isRTL) {
      const rtlMap = {
        translateX: 'translateX',
        translateY: 'translateY',
        scale: 'scale',
        rotate: 'rotate',
        skew: 'skew'
      };
      return rtlMap[direction] || direction;
    }
    return direction;
  };

  const getAnimationDirection = (direction) => {
    if (isRTL) {
      const rtlMap = {
        slideInLeft: 'slideInRight',
        slideInRight: 'slideInLeft',
        slideOutLeft: 'slideOutRight',
        slideOutRight: 'slideOutLeft',
        fadeInLeft: 'fadeInRight',
        fadeInRight: 'fadeInLeft',
        fadeOutLeft: 'fadeOutRight',
        fadeOutRight: 'fadeOutLeft'
      };
      return rtlMap[direction] || direction;
    }
    return direction;
  };

  const getIconDirection = (iconName) => {
    if (isRTL) {
      const rtlMap = {
        'arrow-left': 'arrow-right',
        'arrow-right': 'arrow-left',
        'chevron-left': 'chevron-right',
        'chevron-right': 'chevron-left',
        'caret-left': 'caret-right',
        'caret-right': 'caret-left'
      };
      return rtlMap[iconName] || iconName;
    }
    return iconName;
  };

  const getSortDirection = (direction) => {
    if (isRTL) {
      return direction === 'asc' ? 'desc' : 'asc';
    }
    return direction;
  };

  const value = {
    currentLanguage,
    isRTL,
    languages,
    setLanguage,
    toggleLanguage,
    getCurrentLanguage,
    getSupportedLanguages,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    formatPhoneNumber,
    getTextDirection,
    isRTLDirection,
    getOppositeDirection,
    getAlignment,
    getMarginDirection,
    getPaddingDirection,
    getBorderDirection,
    getFlexDirection,
    getTransformDirection,
    getAnimationDirection,
    getIconDirection,
    getSortDirection
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 