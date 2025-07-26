const express = require('express');
const { body, query } = require('express-validator');
const authController = require('../controlllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authRateLimiter = require('../middleware/rateLimit');

const router = express.Router();

// Registration
router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/[a-z]/).withMessage('must contain a lowercase letter')
      .matches(/[A-Z]/).withMessage('must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('must contain a number')
      .matches(/[^A-Za-z0-9]/).withMessage('must contain a symbol'),
  ],
  validate,
  authController.register
);

// Email Verification
router.get(
  '/verify-email',
  [
    query('token').notEmpty(),
    query('email').isEmail().normalizeEmail(),
  ],
  validate,
  authController.verifyEmail
);

// Login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  validate,
  authController.login
);

// Request Password Reset
router.post(
  '/request-password-reset',
  authRateLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.requestPasswordReset
);

// Reset Password
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/[a-z]/).withMessage('must contain a lowercase letter')
      .matches(/[A-Z]/).withMessage('must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('must contain a number')
      .matches(/[^A-Za-z0-9]/).withMessage('must contain a symbol'),
  ],
  validate,
  authController.resetPassword
);

// Refresh Token
router.post('/refresh-token', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Update Email
router.put(
  '/update-email',
  auth,
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res) => {
    const user = req.user;
    const { email } = req.body;
    user.email = email;
    user.isVerified = false;
    user.verificationToken = require('../utils/token').generateRandomToken();
    await user.save();
    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${user.verificationToken}&email=${email}`;
    await require('../utils/email')({
      to: email,
      subject: 'Verify your new email',
      template: 'verify-email',
      context: { email, verifyUrl, year: new Date().getFullYear() },
    });
    res.json({ message: 'Email updated. Please verify your new email.' });
  }
);
// Update Password
router.put(
  '/update-password',
  auth,
  [
    body('currentPassword').exists(),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/[a-z]/).withMessage('must contain a lowercase letter')
      .matches(/[A-Z]/).withMessage('must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('must contain a number')
      .matches(/[^A-Za-z0-9]/).withMessage('must contain a symbol'),
  ],
  validate,
  async (req, res) => {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    require('fs').appendFileSync(require('path').join(__dirname, '../logs/activity.log'), `${new Date().toISOString()} | User: ${user._id} | Action: password_changed\n`);
    res.json({ message: 'Password updated successfully' });
  }
);
// Delete Account
router.delete(
  '/delete-account',
  auth,
  [body('password').exists()],
  validate,
  async (req, res) => {
    const user = req.user;
    const { password } = req.body;
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Password incorrect' });
    await user.deleteOne();
    require('fs').appendFileSync(require('path').join(__dirname, '../logs/activity.log'), `${new Date().toISOString()} | User: ${user._id} | Action: account_deleted\n`);
    res.json({ message: 'Account deleted successfully' });
  }
);

// Social Login (OAuth) - Placeholder
router.get('/oauth/google', (req, res) => res.status(501).json({ message: 'Google OAuth not implemented yet' }));
router.get('/oauth/facebook', (req, res) => res.status(501).json({ message: 'Facebook OAuth not implemented yet' }));

// List Sessions
router.get('/sessions', auth, authController.listSessions);
// Revoke Session
router.post('/revoke-session', auth, [body('sessionId').notEmpty()], validate, authController.revokeSession);

// MFA Setup
router.get('/mfa/setup', auth, authController.mfaSetup);
router.post('/mfa/verify', auth, [body('token').notEmpty()], validate, authController.mfaVerify);
router.post('/mfa/disable', auth, authController.mfaDisable);

// Security Questions
router.post('/security-questions', auth, authController.setSecurityQuestions);
// Security Questions Verify
router.post('/security-questions/verify', authController.verifySecurityQuestions);
// Regenerate Backup Codes
router.post('/backup-codes/regenerate', auth, authController.regenerateBackupCodes);

// GDPR/CCPA Compliance
router.post('/consent/give', auth, authController.giveConsent);
router.post('/consent/revoke', auth, authController.revokeConsent);
router.get('/export-data', auth, authController.exportData);
router.post('/anonymize', auth, authController.anonymizeAccount);

// Email Preferences
router.get('/email-preferences', auth, authController.getEmailPreferences);
router.put('/email-preferences', auth, authController.updateEmailPreferences);

// Language Preferences
router.get('/language', auth, authController.getLanguage);
router.put('/language', auth, authController.setLanguage);

module.exports = router; 