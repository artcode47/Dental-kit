const User = require('../models/User');
const sendEmail = require('../utils/email');
const { generateJWT, generateRandomToken, generateRefreshToken } = require('../utils/token');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const geoip = require('geoip-lite');
const auditLog = require('../utils/auditLogger');
const i18n = require('i18n');

function logActivity(userId, action, details = '') {
  const logLine = `${new Date().toISOString()} | User: ${userId} | Action: ${action} | ${details}\n`;
  fs.appendFileSync(path.join(__dirname, '../logs/activity.log'), logLine);
}

function getSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

exports.giveConsent = async (req, res) => {
  const user = req.user;
  user.consentGiven = true;
  user.consentTimestamp = new Date();
  await user.save();
  res.json({ message: 'Consent given' });
};
exports.revokeConsent = async (req, res) => {
  const user = req.user;
  user.consentGiven = false;
  await user.save();
  res.json({ message: 'Consent revoked' });
};
exports.exportData = async (req, res) => {
  const user = req.user;
  const data = user.toObject();
  delete data.password;
  delete data.verificationToken;
  delete data.resetPasswordToken;
  delete data.resetPasswordExpires;
  res.json({ data });
};
exports.anonymizeAccount = async (req, res) => {
  const user = req.user;
  user.email = `anonymized_${user._id}@example.com`;
  user.password = 'anonymized';
  user.anonymized = true;
  user.isVerified = false;
  user.securityQuestions = [];
  user.mfaSecret = undefined;
  user.mfaBackupCodes = [];
  user.sessions = [];
  await user.save();
  res.json({ message: 'Account anonymized' });
};

exports.register = async (req, res) => {
  const { email, password, consentGiven, language } = req.body;
  try {
    if (!consentGiven) return res.status(400).json({ message: i18n.__({ phrase: 'Consent required', locale: language || 'en' }) });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: i18n.__({ phrase: 'Email already registered', locale: language || 'en' }) });
    const verificationToken = generateRandomToken();
    user = await User.create({ email, password, verificationToken, consentGiven: true, consentTimestamp: new Date(), language: language || 'en' });
    const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}&email=${email}`;
    await sendEmail({
      to: email,
      subject: i18n.__({ phrase: 'Verify your email', locale: language || 'en' }),
      template: 'verify-email',
      context: { email, verifyUrl, year: new Date().getFullYear() },
    });
    res.status(201).json({ message: i18n.__({ phrase: 'Registration successful, please check your email to verify your account.', locale: language || 'en' }) });
  } catch (err) {
    res.status(500).json({ message: i18n.__({ phrase: 'Server error', locale: language || 'en' }) });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await User.findOne({ email, verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.mfaSetup = async (req, res) => {
  const user = req.user;
  if (user.mfaEnabled) return res.status(400).json({ message: 'MFA already enabled' });
  const secret = speakeasy.generateSecret({ name: `Dental Kit Store (${user.email})` });
  user.mfaSecret = secret.base32;
  await user.save();
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ otpauth_url: secret.otpauth_url, qr });
};
exports.mfaVerify = async (req, res) => {
  const user = req.user;
  const { token } = req.body;
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 1,
  });
  if (!verified) return res.status(400).json({ message: 'Invalid MFA code' });
  user.mfaEnabled = true;
  user.mfaBackupCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex'));
  await user.save();
  res.json({ message: 'MFA enabled', backupCodes: user.mfaBackupCodes });
};
exports.mfaDisable = async (req, res) => {
  const user = req.user;
  user.mfaEnabled = false;
  user.mfaSecret = undefined;
  user.mfaBackupCodes = [];
  await user.save();
  res.json({ message: 'MFA disabled' });
};

exports.login = async (req, res) => {
  const { email, password, mfaToken, mfaBackupCode, mfaEmailOTP } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account locked. Try again later.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        logActivity(user._id, 'account_locked', 'Too many failed login attempts');
      }
      await user.save();
      logActivity(user._id, 'login_failed');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // GeoIP lookup
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip) || {};
    const location = `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`;
    // Risk-based: check if location is new
    let isNewLocation = true;
    if (user.sessions && user.sessions.length > 0) {
      isNewLocation = !user.sessions.some(s => s.ip === ip);
    }
    if (isNewLocation) {
      await sendEmail({
        to: user.email,
        subject: 'New Location Login',
        template: 'new-device',
        context: { email: user.email, userAgent: req.headers['user-agent'] || 'unknown', ip, date: new Date().toLocaleString(), year: new Date().getFullYear(), location },
      });
      logActivity(user._id, 'new_location_login', `ip=${ip}, location=${location}`);
      // Optionally require extra verification (MFA/email OTP)
      if (user.mfaEnabled) {
        return res.status(401).json({ message: 'New location detected. Please complete MFA.' });
      }
    }
    // MFA check
    if (user.mfaEnabled) {
      let mfaPassed = false;
      if (mfaToken) {
        mfaPassed = speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: 'base32',
          token: mfaToken,
          window: 1,
        });
      } else if (mfaBackupCode) {
        const idx = user.mfaBackupCodes.indexOf(mfaBackupCode);
        if (idx !== -1) {
          mfaPassed = true;
          user.mfaBackupCodes.splice(idx, 1);
        }
      } else if (mfaEmailOTP) {
        if (user.mfaEmailOTP === mfaEmailOTP && user.mfaEmailOTPExpires > Date.now()) {
          mfaPassed = true;
          user.mfaEmailOTP = undefined;
          user.mfaEmailOTPExpires = undefined;
        }
      } else {
        // Send email OTP fallback
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.mfaEmailOTP = otp;
        user.mfaEmailOTPExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail({
          to: user.email,
          subject: 'Your Login OTP',
          template: 'mfa-email-otp',
          context: { email: user.email, otp, year: new Date().getFullYear() },
        });
        return res.status(401).json({ message: 'MFA required: check your email for OTP' });
      }
      if (!mfaPassed) {
        await user.save();
        return res.status(401).json({ message: 'Invalid MFA code or backup code' });
      }
    }
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    const accessToken = generateJWT({ id: user._id });
    const refreshToken = generateRefreshToken();
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    // Device/session management (as before)
    const sessionId = getSessionId();
    const userAgent = req.headers['user-agent'] || 'unknown';
    const now = new Date();
    user.sessions = user.sessions || [];
    user.sessions.push({
      sessionId,
      userAgent,
      ip,
      createdAt: now,
      lastUsed: now,
      isRevoked: false,
    });
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    logActivity(user._id, 'login_success', `sessionId=${sessionId}, userAgent=${userAgent}, ip=${ip}`);
    // Notify user if new device
    if (!user.sessions.some(s => s.userAgent === userAgent && s.ip === ip && !s.isRevoked && s.sessionId !== sessionId)) {
      await sendEmail({
        to: user.email,
        subject: 'New Device Login',
        template: 'new-device',
        context: { email: user.email, userAgent, ip, date: now.toLocaleString(), year: now.getFullYear() },
      });
    }
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });
  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    // Optionally rotate refresh token here
    const accessToken = generateJWT({ id: user._id });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listSessions = async (req, res) => {
  const user = req.user;
  res.json({ sessions: user.sessions.map(s => ({
    sessionId: s.sessionId,
    userAgent: s.userAgent,
    ip: s.ip,
    createdAt: s.createdAt,
    lastUsed: s.lastUsed,
    isRevoked: s.isRevoked,
  })) });
};

exports.revokeSession = async (req, res) => {
  const user = req.user;
  const { sessionId } = req.body;
  const session = user.sessions.find(s => s.sessionId === sessionId);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  session.isRevoked = true;
  await user.save();
  logActivity(user._id, 'session_revoked', `sessionId=${sessionId}`);
  res.json({ message: 'Session revoked' });
};

exports.logout = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;
  if (!refreshToken || !sessionId) return res.status(200).json({ message: 'Logged out' });
  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      if (user.sessions) {
        const session = user.sessions.find(s => s.sessionId === sessionId);
        if (session) session.isRevoked = true;
      }
      await user.save();
    }
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      template: 'reset-password',
      context: { email, resetUrl, year: new Date().getFullYear() },
    });
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    logActivity(user._id, 'password_reset');
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setSecurityQuestions = async (req, res) => {
  const user = req.user;
  const { questions } = req.body; // [{question, answer}]
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Questions required' });
  }
  user.securityQuestions = await Promise.all(questions.map(async q => ({
    question: q.question,
    answerHash: await bcrypt.hash(q.answer, 10),
  })));
  await user.save();
  res.json({ message: 'Security questions set' });
};
exports.verifySecurityQuestions = async (req, res) => {
  const { email, answers } = req.body; // [{question, answer}]
  const user = await User.findOne({ email });
  if (!user || !user.securityQuestions || user.securityQuestions.length === 0) {
    return res.status(400).json({ message: 'No security questions set' });
  }
  let allCorrect = true;
  for (let i = 0; i < user.securityQuestions.length; i++) {
    const q = user.securityQuestions[i];
    const provided = answers.find(a => a.question === q.question);
    if (!provided || !(await bcrypt.compare(provided.answer, q.answerHash))) {
      allCorrect = false;
      break;
    }
  }
  if (!allCorrect) return res.status(400).json({ message: 'Incorrect answers' });
  // Allow password reset or send recovery token here
  res.json({ message: 'Security answers verified. You may reset your password.' });
};
exports.regenerateBackupCodes = async (req, res) => {
  const user = req.user;
  user.mfaBackupCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex'));
  await user.save();
  res.json({ backupCodes: user.mfaBackupCodes });
};

exports.getEmailPreferences = async (req, res) => {
  const user = req.user;
  res.json({ emailPreferences: user.emailPreferences });
};
exports.updateEmailPreferences = async (req, res) => {
  const user = req.user;
  const { marketing, security, updates } = req.body;
  if (typeof marketing === 'boolean') user.emailPreferences.marketing = marketing;
  if (typeof security === 'boolean') user.emailPreferences.security = security;
  if (typeof updates === 'boolean') user.emailPreferences.updates = updates;
  await user.save();
  res.json({ emailPreferences: user.emailPreferences });
};

exports.getLanguage = async (req, res) => {
  const user = req.user;
  res.json({ language: user.language });
};
exports.setLanguage = async (req, res) => {
  const user = req.user;
  const { language } = req.body;
  user.language = language;
  await user.save();
  res.json({ language: user.language });
}; 