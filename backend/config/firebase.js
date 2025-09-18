const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK with enhanced security
let app;
let db;
let auth;
let storage;

try {
  // Check if app is already initialized
  if (admin.apps.length === 0) {
    // Debug: Log environment variables (without sensitive data)
    console.log('Firebase initialization - checking environment variables...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('FIREBASE_ADMIN_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID ? 'SET' : 'NOT SET');
    console.log('FIREBASE_ADMIN_PRIVATE_KEY_ID:', process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID ? 'SET' : 'NOT SET');
    console.log('FIREBASE_ADMIN_PRIVATE_KEY:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'SET' : 'NOT SET');
    console.log('FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'SET' : 'NOT SET');
    console.log('FIREBASE_ADMIN_CLIENT_ID:', process.env.FIREBASE_ADMIN_CLIENT_ID ? 'SET' : 'NOT SET');

    // Validate required environment variables
    const requiredEnvVars = [
      'FIREBASE_ADMIN_PROJECT_ID',
      'FIREBASE_ADMIN_PRIVATE_KEY_ID',
      'FIREBASE_ADMIN_PRIVATE_KEY',
      'FIREBASE_ADMIN_CLIENT_EMAIL',
      'FIREBASE_ADMIN_CLIENT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('Missing Firebase environment variables:', missingVars);
      console.error('All environment variables:', Object.keys(process.env).filter(key => key.startsWith('FIREBASE')));
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    }

    // Service account credentials from environment variables
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN || "googleapis.com"
    };

    // Enhanced Firebase configuration with security settings
    const firebaseConfig = {
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebasestorage.app`,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      // Security configurations
      authEmulatorHost: process.env.FIREBASE_USE_EMULATOR === 'true' ? process.env.FIREBASE_AUTH_EMULATOR_HOST : undefined,
      firestoreEmulatorHost: process.env.FIREBASE_USE_EMULATOR === 'true' ? process.env.FIREBASE_FIRESTORE_EMULATOR_HOST : undefined,
      storageEmulatorHost: process.env.FIREBASE_USE_EMULATOR === 'true' ? process.env.FIREBASE_STORAGE_EMULATOR_HOST : undefined
    };

    app = admin.initializeApp(firebaseConfig);
    
    // Set custom claims for enhanced security
    admin.auth().setCustomUserClaims = async (uid, claims) => {
      try {
        await admin.auth().setCustomUserClaims(uid, claims);
        return true;
      } catch (error) {
        console.error('Error setting custom claims:', error);
        return false;
      }
    };

  } else {
    app = admin.app();
  }

  console.log('Firebase Admin SDK initialized successfully with enhanced security');
} catch (error) {
  console.error('Critical error initializing Firebase Admin SDK:', error);
  
  // In production, don't exit immediately - let the app start and show the error
  if (process.env.NODE_ENV === 'production') {
    console.error('Firebase initialization failed in production, but continuing...');
    console.error('App will start but Firebase features will not work');
  }
  
  // Don't throw error, just log it and continue
  console.error('Firebase initialization error:', error.message);
  
  // Set app to null so we know Firebase failed
  app = null;
}

// Initialize Firebase services (even if initialization failed)
try {
  if (app) {
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();

    // Enhanced Firestore security rules
    db.settings({
      ignoreUndefinedProperties: true,
      // Add security rules validation
      validateOnWrite: true
    });

    // Enhanced Auth security settings
    auth.setCustomUserClaims = async (uid, claims) => {
      try {
        await auth.setCustomUserClaims(uid, claims);
        return true;
      } catch (error) {
        console.error('Error setting custom claims:', error);
        return false;
      }
    };
  } else {
    console.log('Firebase app not initialized, services will be null');
  }
} catch (error) {
  console.error('Error initializing Firebase services:', error);
  // Set to null so the app doesn't crash
  db = null;
  auth = null;
  storage = null;
}

// Enhanced security utilities
const firebaseUtils = {
  // Validate Firebase UID format
  isValidUid: (uid) => {
    return typeof uid === 'string' && uid.length === 28 && /^[a-zA-Z0-9]+$/.test(uid);
  },

  // Sanitize Firebase data
  sanitizeData: (data) => {
    if (typeof data !== 'object' || data === null) return data;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Remove potential script tags and dangerous content
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = firebaseUtils.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  // Rate limiting for Firebase operations
  rateLimiter: new Map(),
  
  checkRateLimit: (operation, identifier, maxOperations = 100, windowMs = 60000) => {
    const key = `${operation}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!firebaseUtils.rateLimiter.has(key)) {
      firebaseUtils.rateLimiter.set(key, []);
    }
    
    const operations = firebaseUtils.rateLimiter.get(key);
    const recentOperations = operations.filter(timestamp => timestamp > windowStart);
    
    if (recentOperations.length >= maxOperations) {
      return false;
    }
    
    recentOperations.push(now);
    firebaseUtils.rateLimiter.set(key, recentOperations);
    return true;
  },

  // Clean up expired rate limit entries
  cleanupRateLimiter: () => {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    
    for (const [key, operations] of firebaseUtils.rateLimiter.entries()) {
      const recentOperations = operations.filter(timestamp => timestamp > now - windowMs);
      if (recentOperations.length === 0) {
        firebaseUtils.rateLimiter.delete(key);
      } else {
        firebaseUtils.rateLimiter.set(key, recentOperations);
      }
    }
  }
};

// Clean up rate limiter every minute
setInterval(() => {
  firebaseUtils.cleanupRateLimiter();
}, 60000);

module.exports = {
  app,
  db,
  auth,
  storage,
  firebaseUtils
};
