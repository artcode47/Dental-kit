const FirebaseService = require('./firebaseService');

class SettingsService extends FirebaseService {
  constructor() {
    super('settings');
    this.singletonId = 'global';
  }

  async getSettings() {
    const doc = await this.getById(this.singletonId);
    if (doc) return doc;
    return this.initializeDefaults();
  }

  async initializeDefaults() {
    const defaults = {
      general: {
        siteName: 'DentalKit',
        siteDescription: 'Your Complete Dental Care Solution',
        siteUrl: process.env.CLIENT_URL || 'http://localhost:3000',
        adminEmail: 'admin@dentalkit.com',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        language: 'en'
      },
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: Number(process.env.SMTP_PORT || 587),
        smtpUser: process.env.SMTP_USER || '',
        smtpPassword: '',
        smtpSecure: true,
        fromEmail: process.env.FROM_EMAIL || 'noreply@dentalkit.com',
        fromName: process.env.FROM_NAME || 'DentalKit',
        enableEmailNotifications: true,
        enableOrderNotifications: true,
        enableUserNotifications: true,
        enableMarketingEmails: false
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: ''
      },
      notifications: {
        enablePushNotifications: false
      },
      updatedAt: new Date()
    };
    await this.createWithId(this.singletonId, defaults);
    return { id: this.singletonId, ...defaults };
  }

  async updateSettings(partialSettings) {
    const existing = await this.getSettings();
    const merged = {
      ...existing,
      ...partialSettings,
      general: { ...(existing.general || {}), ...(partialSettings.general || {}) },
      email: { ...(existing.email || {}), ...(partialSettings.email || {}) },
      cloudinary: { ...(existing.cloudinary || {}), ...(partialSettings.cloudinary || {}) },
      notifications: { ...(existing.notifications || {}), ...(partialSettings.notifications || {}) },
      updatedAt: new Date()
    };
    await this.update(this.singletonId, merged);
    return merged;
  }
}

module.exports = SettingsService;




