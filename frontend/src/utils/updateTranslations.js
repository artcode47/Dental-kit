// This is a utility script to help identify and fix translation issues
// Run this in the browser console to check for missing translations

export const checkMissingTranslations = () => {
  const missingKeys = [];
  
  // Check all elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = el.textContent;
    if (translation === key) {
      missingKeys.push(key);
    }
  });
  
  console.log('Missing translation keys:', missingKeys);
  return missingKeys;
};

export const fixTranslationImports = () => {
  // This function can be used to automatically update import statements
  // For now, it's a manual process but this could be automated
  console.log('To fix translation imports, replace:');
  console.log("import { useTranslation } from 'react-i18next';");
  console.log('with:');
  console.log("import { useTranslation } from '../hooks/useTranslation';");
}; 