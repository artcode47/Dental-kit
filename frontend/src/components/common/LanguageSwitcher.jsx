import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = ({ 
  variant = 'dropdown',
  size = 'md',
  className,
  showFlags = true,
  showNames = true,
  showNativeNames = false
}) => {
  const { t } = useTranslation('ecommerce');
  const { currentLanguage, setLanguage, getSupportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = getSupportedLanguages();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const buttonSizes = {
    sm: 'px-2 py-1',
    md: 'px-3 py-2',
    lg: 'px-4 py-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
              ${currentLanguage === language.code
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${sizes[size]}
            `}
          >
            {showFlags && (
              <span className="text-lg">{language.flag}</span>
            )}
            {showNames && (
              <span>
                {showNativeNames ? language.nativeName : language.name}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-left bg-white text-gray-700 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200
          ${buttonSizes[size]}
          ${sizes[size]}
        `}
      >
        <div className="flex items-center space-x-2">
          {showFlags && (
            <span className="text-lg">{currentLang?.flag}</span>
          )}
          {showNames && (
            <span className="font-medium">
              {showNativeNames ? currentLang?.nativeName : currentLang?.name}
            </span>
          )}
        </div>
        <ChevronDownIcon 
          className={`${iconSizes[size]} text-gray-500 dark:text-gray-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200
                  ${currentLanguage === language.code ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'text-gray-700 dark:text-gray-200'}
                  ${sizes[size]}
                `}
              >
                {showFlags && (
                  <span className="text-lg mr-3">{language.flag}</span>
                )}
                {showNames && (
                  <span>
                    {showNativeNames ? language.nativeName : language.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 