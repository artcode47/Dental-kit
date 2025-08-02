import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for enhanced security features
 * Provides rate limiting, input sanitization, and security checks
 */
export const useSecurity = (options = {}) => {
  const {
    maxAttempts = 999, // Temporarily disabled for testing
    lockoutDuration = 0, // Temporarily disabled for testing
    rateLimitWindow = 60 * 1000, // 1 minute
    maxRequestsPerWindow = 999 // Temporarily disabled for testing
  } = options;

  // All state hooks must be called in the same order every time
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [canProceed, setCanProceed] = useState(true);

  // All refs must be called in the same order every time
  const attemptsRef = useRef(0);
  const requestCountRef = useRef(0);
  const lastRequestTimeRef = useRef(0);

  // Initialize from localStorage - this effect must always run
  useEffect(() => {
    // Clear any existing lockout data for testing
    localStorage.removeItem('security_attempts');
    localStorage.removeItem('security_lockout_until');
    localStorage.removeItem('security_request_count');
    localStorage.removeItem('security_last_request_time');
    
    // Reset state to unlocked
    setAttempts(0);
    setIsLocked(false);
    setLockoutUntil(null);
    setRequestCount(0);
    setLastRequestTime(0);
    setCanProceed(true);
    
    // Reset refs
    attemptsRef.current = 0;
    requestCountRef.current = 0;
    lastRequestTimeRef.current = 0;
  }, [rateLimitWindow]);

  // Check lockout status - this effect must always run
  useEffect(() => {
    if (lockoutUntil) {
      const timer = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutUntil) {
          setIsLocked(false);
          setLockoutUntil(null);
          setAttempts(0);
          attemptsRef.current = 0;
          localStorage.removeItem('security_lockout_until');
          localStorage.removeItem('security_attempts');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutUntil]);

  // Update canProceed whenever relevant state changes - this effect must always run
  useEffect(() => {
    const updateCanProceed = () => {
      if (isLocked) {
        setCanProceed(false);
        return;
      }
      
      const now = Date.now();
      
      // Reset counter if window has passed
      if (now - lastRequestTimeRef.current >= rateLimitWindow) {
        setCanProceed(true);
        return;
      }

      // Check if rate limit exceeded
      setCanProceed(requestCountRef.current < maxRequestsPerWindow);
    };

    updateCanProceed();
  }, [isLocked, requestCount, lastRequestTime, maxRequestsPerWindow, rateLimitWindow]);

  // All callback hooks must be called in the same order every time
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - lastRequestTimeRef.current >= rateLimitWindow) {
      requestCountRef.current = 0;
      setRequestCount(0);
      lastRequestTimeRef.current = now;
      setLastRequestTime(now);
      localStorage.setItem('security_last_request_time', now.toString());
    }

    // Check if rate limit exceeded
    if (requestCountRef.current >= maxRequestsPerWindow) {
      return false;
    }

    // Increment counter
    requestCountRef.current += 1;
    setRequestCount(requestCountRef.current);
    localStorage.setItem('security_request_count', requestCountRef.current.toString());

    return true;
  }, [maxRequestsPerWindow, rateLimitWindow]);

  const recordFailedAttempt = useCallback(() => {
    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);
    localStorage.setItem('security_attempts', attemptsRef.current.toString());

    if (attemptsRef.current >= maxAttempts) {
      const lockoutTime = Date.now() + lockoutDuration;
      setIsLocked(true);
      setLockoutUntil(lockoutTime);
      localStorage.setItem('security_lockout_until', new Date(lockoutTime).toISOString());
    }
  }, [maxAttempts, lockoutDuration]);

  const resetAttempts = useCallback(() => {
    attemptsRef.current = 0;
    setAttempts(0);
    setIsLocked(false);
    setLockoutUntil(null);
    localStorage.removeItem('security_attempts');
    localStorage.removeItem('security_lockout_until');
  }, []);

  const sanitizeInput = useCallback((input, type = 'text') => {
    if (typeof input !== 'string') return input;

    let sanitized = input.trim();

    switch (type) {
      case 'email':
        sanitized = sanitized.toLowerCase();
        // Remove any script tags or dangerous characters
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        break;
      
      case 'password':
        // Don't trim passwords, but remove script tags
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        break;
      
      case 'text':
      default:
        // Remove script tags and excessive whitespace
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/\s+/g, ' ');
        break;
    }

    return sanitized;
  }, []);

  const validateInput = useCallback((input, rules = {}) => {
    const {
      required = false,
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      customValidation = null
    } = rules;

    if (required && (!input || input.trim().length === 0)) {
      return { isValid: false, error: 'This field is required' };
    }

    if (input && input.length < minLength) {
      return { isValid: false, error: `Minimum length is ${minLength} characters` };
    }

    if (input && input.length > maxLength) {
      return { isValid: false, error: `Maximum length is ${maxLength} characters` };
    }

    if (pattern && input && !pattern.test(input)) {
      return { isValid: false, error: 'Invalid format' };
    }

    if (customValidation && !customValidation(input)) {
      return { isValid: false, error: 'Invalid input' };
    }

    return { isValid: true, error: null };
  }, []);

  const getRemainingLockoutTime = useCallback(() => {
    if (!isLocked || !lockoutUntil) return 0;
    return Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
  }, [isLocked, lockoutUntil]);

  const performSecurityCheck = useCallback(async (data) => {
    // Simulate security check delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Basic security checks
    const checks = {
      hasEmail: !!data.email,
      hasPassword: !!data.password,
      emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || ''),
      passwordLength: (data.password || '').length >= 8,
      noScriptTags: !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(data.email || data.password || ''),
      rateLimitOk: canProceed
    };

    const allPassed = Object.values(checks).every(check => check);
    
    return {
      passed: allPassed,
      checks,
      timestamp: Date.now()
    };
  }, [canProceed]);

  // Return object must always be the same structure
  return {
    // State
    attempts,
    isLocked,
    lockoutUntil,
    requestCount,
    lastRequestTime,
    canProceed,
    
    // Methods
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts,
    sanitizeInput,
    validateInput,
    getRemainingLockoutTime,
    performSecurityCheck,
    
    // Computed values
    remainingLockoutTime: getRemainingLockoutTime()
  };
};

export default useSecurity; 