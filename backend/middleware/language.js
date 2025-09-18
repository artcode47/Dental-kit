const i18n = require('i18n');
const UserService = require('../services/userService');

const userService = new UserService();

/**
 * Language detection middleware
 * Detects user's preferred language from various sources
 */
const languageDetection = (req, res, next) => {
  let language = null;
  
  // 1. Check query parameter
  if (req.query.lang) {
    language = req.query.lang.toLowerCase();
  }
  
  // 2. Check Accept-Language header
  if (!language && req.headers['accept-language']) {
    const acceptLanguage = req.headers['accept-language'];
    const languages = acceptLanguage.split(',').map(lang => {
      const [code] = lang.split(';');
      return code.trim().toLowerCase();
    });
    
    // Find first supported language
    const supportedLanguages = ['en', 'ar', 'fr', 'es'];
    language = languages.find(lang => {
      const baseLang = lang.split('-')[0];
      return supportedLanguages.includes(baseLang);
    });
    
    if (language) {
      language = language.split('-')[0];
    }
  }
  
  // 3. Check user's saved preference
  if (!language && req.user && req.user.language) {
    language = req.user.language;
  }
  
  // Default to English if no language detected
  if (!language || !['en', 'ar', 'fr', 'es'].includes(language)) {
    language = 'en';
  }
  
  // Set language for i18n
  req.setLocale(language);
  
  // Add language info to request object
  req.language = language;
  req.isRTL = language === 'ar';
  
  // Add language info to response locals for templates
  res.locals.language = language;
  res.locals.isRTL = req.isRTL;
  
  next();
};

/**
 * RTL support middleware
 * Adds RTL-specific headers and classes
 */
const rtlSupport = (req, res, next) => {
  const isRTL = req.language === 'ar';
  
  // Add RTL info to response headers
  res.set('X-Language', req.language);
  res.set('X-RTL', isRTL.toString());
  
  // Add RTL info to response body for API responses
  res.locals.rtlInfo = {
    language: req.language,
    isRTL: isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  };
  
  next();
};

/**
 * Language validation middleware
 * Ensures only supported languages are used
 */
const validateLanguage = (req, res, next) => {
  const supportedLanguages = ['en', 'ar', 'fr', 'es'];
  const language = req.query.lang || req.language;
  
  if (language && !supportedLanguages.includes(language)) {
    return res.status(400).json({
      message: req.__('validation.invalid_language'),
      supportedLanguages
    });
  }
  
  next();
};

/**
 * Get supported languages
 */
const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
    { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false }
  ];
};

/**
 * Update user language preference
 */
const updateUserLanguage = async (userId, language) => {
  try {
    await userService.update(userId, { language });
    return true;
  } catch (error) {
    console.error('Error updating user language:', error);
    return false;
  }
};

module.exports = {
  languageDetection,
  rtlSupport,
  validateLanguage,
  getSupportedLanguages,
  updateUserLanguage
}; 