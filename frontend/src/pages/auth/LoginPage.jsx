import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSecurity } from '../../hooks/useSecurity';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, isLocked, lockoutUntil } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Security hook
  const {
    isLocked: securityLocked,
    lockoutUntil: securityLockoutUntil,
    recordFailedAttempt,
    resetAttempts,
    sanitizeInput,
    validateInput,
    performSecurityCheck,
    canProceed
  } = useSecurity({
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    rateLimitWindow: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 10
  });

  // Local state
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityCheck, setSecurityCheck] = useState(false);

  // Get redirect path from location state (if user was redirected from protected route)
  const from = location.state?.from?.pathname || '/';

  // Validation schema with enhanced security
  const schema = useMemo(() => yup.object().shape({
    email: yup
      .string()
      .required(t('validation.email.required'))
      .email(t('validation.email.invalid'))
      .max(254, t('validation.email.tooLong'))
      .trim(),
    password: yup
      .string()
      .required(t('validation.password.required'))
      .min(8, t('validation.password.min'))
      .max(128, t('validation.password.tooLong'))
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Watch form values for security checks
  const watchedValues = watch();

  // Security check effect
  useEffect(() => {
    if (isDirty && watchedValues.email && watchedValues.password) {
      // Perform security check
      const checkSecurity = async () => {
        const securityResult = await performSecurityCheck(watchedValues);
        setSecurityCheck(securityResult.passed);
      };
      
      const timer = setTimeout(checkSecurity, 500);
      return () => clearTimeout(timer);
    }
  }, [isDirty, watchedValues.email, watchedValues.password, performSecurityCheck]);

  // Handle account lockout
  useEffect(() => {
    if ((isLocked || securityLocked) && (lockoutUntil || securityLockoutUntil)) {
      const lockoutTime = new Date(lockoutUntil || securityLockoutUntil).getTime();
      const now = Date.now();
      const remainingTime = Math.ceil((lockoutTime - now) / 1000);
      
      if (remainingTime > 0) {
        toast.error(t('auth.common.accountTemporarilyLocked'));
      }
    }
  }, [isLocked, securityLocked, lockoutUntil, securityLockoutUntil, t]);

  // Enhanced form submission with security measures
  const onSubmit = useCallback(async (data) => {
    if (isSubmitting || isLocked || securityLocked || !canProceed) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      // Additional client-side security checks
      if (!data.email || !data.password) {
        throw new Error(t('validation.allFieldsRequired'));
      }

      // Sanitize input
      const sanitizedData = {
        email: sanitizeInput(data.email, 'email'),
        password: sanitizeInput(data.password, 'password'),
        rememberMe
      };

      // Validate sanitized input
      const emailValidation = validateInput(sanitizedData.email, {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      });

      const passwordValidation = validateInput(sanitizedData.password, {
        required: true,
        minLength: 8
      });

      if (!emailValidation.isValid) {
        setError('email', { type: 'manual', message: emailValidation.error });
        throw new Error(emailValidation.error);
      }

      if (!passwordValidation.isValid) {
        setError('password', { type: 'manual', message: passwordValidation.error });
        throw new Error(passwordValidation.error);
      }

      const loginResult = await login(sanitizedData);
      
      // Success - reset security attempts
      resetAttempts();
      
      // Success feedback
      toast.success(t('auth.login.success'));
      
      // Check user role and redirect accordingly
      if (loginResult.user?.role === 'admin') {
        // Redirect admin users to admin dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Navigate to the page they were trying to access, or dashboard
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Record failed attempt
      recordFailedAttempt();
      
      // Handle specific error cases with proper user feedback
      if (error.response?.status === 403) {
        setError('email', { 
          type: 'manual', 
          message: t('auth.login.emailNotVerified')
        });
        toast.error(t('auth.login.emailNotVerified'));
      } else if (error.response?.status === 423) {
        setError('email', { 
          type: 'manual', 
          message: t('auth.login.accountLocked')
        });
        toast.error(t('auth.login.accountLocked'));
      } else if (error.response?.status === 401 && error.response?.data?.message?.includes('MFA')) {
        // Handle MFA requirement
        navigate('/mfa-login', { 
          state: { 
            email: data.email,
            from: from 
          } 
        });
      } else if (error.response?.status === 429) {
        toast.error(t('auth.login.rateLimitExceeded'));
      } else if (error.response?.status === 400) {
        setError('email', { 
          type: 'manual', 
          message: t('auth.login.invalidCredentials') 
        });
        setError('password', { 
          type: 'manual', 
          message: t('auth.login.invalidCredentials') 
        });
      } else {
        // Generic error handling
        toast.error(t('auth.login.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    login, 
    navigate, 
    from, 
    rememberMe, 
    isLocked, 
    securityLocked, 
    canProceed,
    isSubmitting, 
    setError, 
    clearErrors, 
    t,
    sanitizeInput,
    validateInput,
    recordFailedAttempt,
    resetAttempts
  ]);

  // Get logo path based on theme
  const getLogoPath = useCallback(() => {
    if (isDark()) {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  }, [isDark]);

  // Calculate remaining lockout time
  const calculateRemainingLockoutTime = useCallback(() => {
    const backendLockout = isLocked && lockoutUntil ? 
      Math.max(0, Math.ceil((new Date(lockoutUntil).getTime() - Date.now()) / 1000)) : 0;
    
    const securityLockout = securityLocked && securityLockoutUntil ? 
      Math.max(0, Math.ceil((securityLockoutUntil - Date.now()) / 1000)) : 0;
    
    return Math.max(backendLockout, securityLockout);
  }, [isLocked, lockoutUntil, securityLocked, securityLockoutUntil]);

  const remainingTime = calculateRemainingLockoutTime();
  const isAccountLocked = isLocked || securityLocked;

  // Accessibility improvements
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && isValid && !isSubmitting && !isAccountLocked && canProceed) {
      handleSubmit(onSubmit)();
    }
  }, [isValid, isSubmitting, isAccountLocked, canProceed, handleSubmit, onSubmit]);

  // Form reset on unmount
  useEffect(() => {
    return () => {
      reset();
      setSecurityCheck(false);
    };
  }, [reset]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Section - Branding/Marketing */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="text-center text-white relative z-10 max-w-md">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <img
                src={getLogoPath()}
                alt="DentalKit Logo"
                className="w-24 h-24 object-contain filter brightness-0 invert drop-shadow-lg"
                loading="eager"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight drop-shadow-lg">
              DentalKit
            </h1>
            <p className="text-lg opacity-90 drop-shadow-md">
              Professional Dental Supplies
            </p>
          </div>
          
          <div className="space-y-3 text-base leading-relaxed">
            <p className="font-medium drop-shadow-md">
              {t('auth.common.trustedPartner')}
            </p>
            <p className="opacity-90 drop-shadow-md">
              {t('auth.common.streamlinePractice')}
            </p>
          </div>
          
          {/* Enhanced Security badges */}
          <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>{t('auth.common.secureLogin')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <LockClosedIcon className="w-5 h-5" />
              <span>{t('auth.common.sslEncrypted')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo for smaller screens */}
          <div className="lg:hidden text-center mb-4 sm:mb-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <img
                src={getLogoPath()}
                alt="DentalKit Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md"
                loading="eager"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              DentalKit
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Professional Dental Supplies
            </p>
          </div>

          {/* Enhanced Form Container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 lg:p-8 border border-white/20 dark:border-gray-700/50">
            {/* Enhanced Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg">
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {t('auth.login.title')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300">
                {t('auth.login.tagline')}
              </p>
            </div>

            {/* Enhanced Account lockout warning */}
            {isAccountLocked && remainingTime > 0 && (
              <div className="mb-4 sm:mb-6 p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <LockClosedIcon className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">
                      {t('auth.common.accountTemporarilyLocked')}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300">
                      {t('auth.common.tryAgainIn', { time: remainingTime })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Login Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-3 sm:space-y-4 lg:space-y-6"
              noValidate
              autoComplete="off"
            >
              {/* Enhanced Email Field */}
              <div className="space-y-1 sm:space-y-2">
                <Input
                  label={t('auth.login.email')}
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  {...register('email')}
                  error={errors.email?.message}
                  leftIcon={<EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />}
                  fullWidth
                  disabled={isAccountLocked || isSubmitting}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  onKeyPress={handleKeyPress}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-1 sm:space-y-2">
                <Input
                  label={t('auth.login.password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  {...register('password')}
                  error={errors.password?.message}
                  fullWidth
                  disabled={isAccountLocked || isSubmitting}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  leftIcon={<LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </button>
                  }
                  onKeyPress={handleKeyPress}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />
              </div>

              {/* Enhanced Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isAccountLocked || isSubmitting}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 hover:border-teal-500 transition-colors"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="ml-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {t('auth.login.rememberMe')}
                  </label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-xs sm:text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200 font-medium hover:underline"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              {/* Enhanced Security Check Indicator */}
              {securityCheck && !isAccountLocked && (
                <div className="flex items-center justify-center p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
                    {t('auth.common.securityCheckPassed')}
                  </span>
                </div>
              )}

              {/* Enhanced Login Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!isValid || isAccountLocked || isSubmitting || !canProceed}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 sm:py-3 lg:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
                aria-describedby={isAccountLocked ? 'lockout-message' : undefined}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span className="text-xs sm:text-sm lg:text-base">{t('auth.login.signingIn')}...</span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm lg:text-base">{t('auth.login.signIn')}</span>
                )}
              </Button>
            </form>

            {/* Enhanced Registration Link */}
            <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t('auth.login.noAccount')}{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200 hover:underline"
                >
                  {t('auth.login.register')}
                </Link>
              </p>
            </div>

            {/* Enhanced Security Notice */}
            <div className="mt-3 sm:mt-4 lg:mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('auth.login.securityNotice')}{' '}
                <Link to="/terms" className="underline hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t('auth.common.termsOfService')}
                </Link>{' '}
                {t('auth.common.and')}{' '}
                <Link to="/privacy" className="underline hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  {t('auth.common.privacyPolicy')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 