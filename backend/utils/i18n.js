const i18n = require('i18n');

/**
 * Get translated message with fallback
 * @param {string} key - Translation key
 * @param {string} locale - Language code
 * @param {Object} options - Translation options
 * @returns {string} Translated message
 */
const getMessage = (key, locale = 'en', options = {}) => {
  try {
    return i18n.__({ phrase: key, locale }, options);
  } catch (error) {
    console.error(`Translation error for key: ${key}, locale: ${locale}`, error);
    return key; // Fallback to key if translation fails
  }
};

/**
 * Get translated message for request context
 * @param {Object} req - Express request object
 * @param {string} key - Translation key
 * @param {Object} options - Translation options
 * @returns {string} Translated message
 */
const getMessageForRequest = (req, key, options = {}) => {
  const locale = req.language || 'en';
  return getMessage(key, locale, options);
};

/**
 * Get all translations for a specific locale
 * @param {string} locale - Language code
 * @returns {Object} All translations for the locale
 */
const getAllTranslations = (locale = 'en') => {
  try {
    return i18n.getCatalog(locale);
  } catch (error) {
    console.error(`Error getting translations for locale: ${locale}`, error);
    return {};
  }
};

/**
 * Check if a translation key exists
 * @param {string} key - Translation key
 * @param {string} locale - Language code
 * @returns {boolean} True if key exists
 */
const hasTranslation = (key, locale = 'en') => {
  try {
    const catalog = i18n.getCatalog(locale);
    return key in catalog;
  } catch (error) {
    return false;
  }
};

/**
 * Get supported locales
 * @returns {Array} Array of supported locale codes
 */
const getSupportedLocales = () => {
  return i18n.getLocales();
};

/**
 * Format error response with translation
 * @param {Object} req - Express request object
 * @param {string} key - Translation key
 * @param {number} statusCode - HTTP status code
 * @param {Object} additionalData - Additional response data
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = (req, key, statusCode = 400, additionalData = {}) => {
  return {
    status: 'error',
    message: getMessageForRequest(req, key),
    statusCode,
    ...additionalData
  };
};

/**
 * Format success response with translation
 * @param {Object} req - Express request object
 * @param {string} key - Translation key
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted success response
 */
const formatSuccessResponse = (req, key, data = {}, statusCode = 200) => {
  return {
    status: 'success',
    message: getMessageForRequest(req, key),
    data,
    statusCode
  };
};

/**
 * Get RTL information for a locale
 * @param {string} locale - Language code
 * @returns {Object} RTL information
 */
const getRTLInfo = (locale) => {
  const isRTL = locale === 'ar';
  return {
    language: locale,
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  };
};

/**
 * Translate validation error messages
 * @param {Object} req - Express request object
 * @param {Object} errors - Validation errors
 * @returns {Object} Translated validation errors
 */
const translateValidationErrors = (req, errors) => {
  const translatedErrors = {};
  
  Object.keys(errors).forEach(field => {
    const fieldErrors = errors[field];
    if (Array.isArray(fieldErrors)) {
      translatedErrors[field] = fieldErrors.map(error => {
        if (typeof error === 'string') {
          return getMessageForRequest(req, error);
        }
        return error;
      });
    } else {
      translatedErrors[field] = getMessageForRequest(req, fieldErrors);
    }
  });
  
  return translatedErrors;
};

module.exports = {
  getMessage,
  getMessageForRequest,
  getAllTranslations,
  hasTranslation,
  getSupportedLocales,
  formatErrorResponse,
  formatSuccessResponse,
  getRTLInfo,
  translateValidationErrors
}; 