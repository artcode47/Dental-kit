import DOMPurify from 'dompurify';

class SecurityUtils {
  /**
   * Sanitize input based on type
   * @param {string} input - The input to sanitize
   * @param {string} type - The type of sanitization ('text', 'html', 'email', 'url')
   * @returns {string} - Sanitized input
   */
  static sanitizeInput(input, type = 'text') {
    if (!input || typeof input !== 'string') {
      return '';
    }

    switch (type) {
      case 'html':
        return DOMPurify.sanitize(input, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: ['href', 'target']
        });
      
      case 'email':
        // Basic email sanitization
        return input.toLowerCase().trim().replace(/[^\w@.-]/g, '');
      
      case 'url':
        // Basic URL sanitization
        return input.trim().replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%]/g, '');
      
      case 'text':
      default:
        // Remove HTML tags and dangerous characters
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }
  }

  /**
   * Validate input based on rules
   * @param {string} input - The input to validate
   * @param {object} rules - Validation rules
   * @returns {object} - Validation result
   */
  static validateInput(input, rules = {}) {
    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      type = 'text'
    } = rules;

    // Check if input exists
    if (!input && required) {
      return {
        isValid: false,
        message: 'This field is required',
        value: ''
      };
    }

    if (!input) {
      return {
        isValid: true,
        message: '',
        value: ''
      };
    }

    const sanitizedInput = this.sanitizeInput(input, type);

    // Check length
    if (sanitizedInput.length < minLength) {
      return {
        isValid: false,
        message: `Minimum length is ${minLength} characters`,
        value: sanitizedInput
      };
    }

    if (sanitizedInput.length > maxLength) {
      return {
        isValid: false,
        message: `Maximum length is ${maxLength} characters`,
        value: sanitizedInput
      };
    }

    // Check pattern
    if (pattern && !pattern.test(sanitizedInput)) {
      return {
        isValid: false,
        message: 'Invalid format',
        value: sanitizedInput
      };
    }

    return {
      isValid: true,
      message: '',
      value: sanitizedInput
    };
  }

  /**
   * Generate CSRF token
   * @returns {string} - CSRF token
   */
  static generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash data using SHA-256
   * @param {string} data - Data to hash
   * @returns {Promise<string>} - Hashed data
   */
  static async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate file upload
   * @param {File} file - File to validate
   * @param {object} options - Validation options
   * @returns {object} - Validation result
   */
  static validateFileUpload(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    } = options;

    if (!file) {
      return {
        isValid: false,
        message: 'No file selected'
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'Invalid file type'
      };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        message: 'Invalid file extension'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Rate limiting utility
   */
  static rateLimiter = {
    requests: new Map(),
    
    /**
     * Check if request is allowed
     * @param {string} key - Unique identifier (e.g., IP, user ID)
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} - Whether request is allowed
     */
    isAllowed(key, maxRequests = 100, windowMs = 60000) {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }
      
      const requests = this.requests.get(key);
      
      // Remove old requests outside the window
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      this.requests.set(key, validRequests);
      
      // Check if we're under the limit
      if (validRequests.length >= maxRequests) {
        return false;
      }
      
      // Add current request
      validRequests.push(now);
      return true;
    },
    
    /**
     * Clear old entries to prevent memory leaks
     */
    cleanup() {
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      for (const [key, requests] of this.requests.entries()) {
        const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
        if (validRequests.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }
    }
  };

  /**
   * XSS prevention - escape HTML
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Content Security Policy nonce generator
   * @returns {string} - Nonce
   */
  static generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Cleanup rate limiter every 5 minutes
setInterval(() => {
  SecurityUtils.rateLimiter.cleanup();
}, 5 * 60 * 1000);

export default SecurityUtils; 