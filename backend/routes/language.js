const express = require('express');
const { body, query } = require('express-validator');
const { validateLanguage, getSupportedLanguages, updateUserLanguage } = require('../middleware/language');
const { getAllTranslations, getRTLInfo } = require('../utils/i18n');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const router = express.Router();

/**
 * @route   GET /api/language/supported
 * @desc    Get all supported languages
 * @access  Public
 */
router.get('/supported', (req, res) => {
  try {
    const languages = getSupportedLanguages();
    res.json({
      status: 'success',
      data: languages,
      rtlInfo: getRTLInfo(req.language)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('common.internal_server_error'),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/language/translations
 * @desc    Get all translations for current language
 * @access  Public
 */
router.get('/translations', [
  query('locale').optional().isIn(['en', 'ar', 'fr', 'es']).withMessage('Invalid locale')
], validate, (req, res) => {
  try {
    const locale = req.query.locale || req.language || 'en';
    const translations = getAllTranslations(locale);
    const rtlInfo = getRTLInfo(locale);
    
    res.json({
      status: 'success',
      data: {
        translations,
        rtlInfo,
        currentLanguage: locale
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('common.internal_server_error'),
      error: error.message
    });
  }
});

/**
 * @route   POST /api/language/update
 * @desc    Update user's language preference
 * @access  Private
 */
router.post('/update', auth, [
  body('language').isIn(['en', 'ar', 'fr', 'es']).withMessage('Invalid language')
], validate, async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user._id;
    
    const success = await updateUserLanguage(userId, language);
    
    if (success) {
      res.json({
        status: 'success',
        message: req.__('common.success'),
        data: {
          language,
          rtlInfo: getRTLInfo(language)
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: req.__('common.internal_server_error')
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('common.internal_server_error'),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/language/current
 * @desc    Get current language and RTL info
 * @access  Public
 */
router.get('/current', (req, res) => {
  try {
    const currentLanguage = req.language || 'en';
    const rtlInfo = getRTLInfo(currentLanguage);
    
    res.json({
      status: 'success',
      data: {
        language: currentLanguage,
        rtlInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('common.internal_server_error'),
      error: error.message
    });
  }
});

module.exports = router; 