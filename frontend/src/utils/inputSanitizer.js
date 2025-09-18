// Input sanitization utility to prevent XSS and injection attacks

// HTML entities mapping
const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Escape HTML entities
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char]);
};

// Sanitize string input
export const sanitizeString = (input, options = {}) => {
  if (input === null || input === undefined) return '';
  
  let sanitized = String(input).trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Escape HTML if requested
  if (options.escapeHtml !== false) {
    sanitized = escapeHtml(sanitized);
  }
  
  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  // Convert to lowercase if requested
  if (options.toLowerCase) {
    sanitized = sanitized.toLowerCase();
  }
  
  // Remove extra whitespace
  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }
  
  return sanitized;
};

// Sanitize email
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  let sanitized = sanitizeString(email, { 
    toLowerCase: true, 
    normalizeWhitespace: true 
  });
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

// Sanitize phone number
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  
  let sanitized = sanitizeString(phone, { normalizeWhitespace: true });
  
  // Remove all non-digit characters except +, -, (, ), and space
  sanitized = sanitized.replace(/[^\d\s\+\-\(\)]/g, '');
  
  // Remove extra spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
};

// Sanitize object recursively
export const sanitizeObject = (obj, options = {}) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key, { escapeHtml: false });
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    }
    return sanitized;
  }
  
  return obj;
};

// Validate and sanitize form data
export const sanitizeFormData = (formData, schema = {}) => {
  const sanitized = {};
  const errors = {};
  
  for (const [field, value] of Object.entries(formData)) {
    try {
      const fieldSchema = schema[field] || {};
      
      switch (fieldSchema.type) {
        case 'email':
          sanitized[field] = sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[field] = sanitizePhone(value);
          break;
        case 'string':
          sanitized[field] = sanitizeString(value, fieldSchema.options);
          break;
        case 'number':
          const num = parseFloat(value);
          if (isNaN(num)) {
            errors[field] = 'Invalid number';
          } else {
            sanitized[field] = num;
          }
          break;
        case 'boolean':
          sanitized[field] = Boolean(value);
          break;
        default:
          sanitized[field] = sanitizeString(value);
      }
      
      // Apply custom validation
      if (fieldSchema.validate) {
        const validationResult = fieldSchema.validate(sanitized[field]);
        if (validationResult !== true) {
          errors[field] = validationResult;
        }
      }
      
    } catch (error) {
      errors[field] = error.message;
    }
  }
  
  if (Object.keys(errors).length > 0) {
    throw new Error('Validation failed', { cause: errors });
  }
  
  return sanitized;
};

// Prevent XSS in user-generated content
export const sanitizeUserContent = (content) => {
  if (typeof content !== 'string') return content;
  
  // Remove script tags and event handlers
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Escape remaining HTML
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
};

// Validate file upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new Error('File extension not allowed');
  }
  
  return true;
};

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,
  sanitizeFormData,
  sanitizeUserContent,
  validateFile
}; 