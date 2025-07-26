const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Translate error messages if i18n is available
    const translatedErrors = errors.array().map(error => ({
      ...error,
      msg: req.__ ? req.__(error.msg) : error.msg
    }));
    
    return res.status(400).json({ 
      status: 'error',
      message: req.__ ? req.__('validation.validation_failed') : 'Validation failed',
      errors: translatedErrors 
    });
  }
  next();
}; 