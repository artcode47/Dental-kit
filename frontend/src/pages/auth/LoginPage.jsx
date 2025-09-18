import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSecurity } from '../../hooks/useSecurity';
import Seo from '../../components/seo/Seo';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AnimatedSection from '../../components/animations/AnimatedSection';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
  ClockIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { sanitizeEmail, sanitizeString } from '../../utils/inputSanitizer';

const LoginPage = () => {
  const { t } = useTranslation('auth');
  const { t: tSeo } = useTranslation('ecommerce');
  const { login, isLocked, lockoutUntil } = useAuth();
  const { isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Security hook
  const {
    isLocked: securityLocked,
    lockoutUntil: securityLockoutUntil,
    recordFailedAttempt,
    resetAttempts,
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
    formState: { errors, isValid },
    setError,
    clearErrors,
    watch
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
    if (watchedValues.email && watchedValues.password) {
      const check = performSecurityCheck({
        email: watchedValues.email,
        password: watchedValues.password
      });
      setSecurityCheck(check);
    }
  }, [watchedValues.email, watchedValues.password, performSecurityCheck]);

  // Account lockout check
  const isAccountLocked = isLocked || securityLocked;
  const lockoutTime = lockoutUntil || securityLockoutUntil;

  // Enhanced form submission with security
  const onSubmit = useCallback(async (data) => {
    if (!canProceed || isAccountLocked) {
      return;
    }

    setIsSubmitting(true);
    clearErrors();

    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeEmail(data.email),
        password: sanitizeString(data.password)
      };

      // Validate inputs
      if (!validateInput(sanitizedData.email) || !validateInput(sanitizedData.password)) {
        throw new Error('Invalid input detected');
      }

      // Attempt login
      const result = await login({ email: sanitizedData.email, password: sanitizedData.password });
      if (!result?.success) {
        throw new Error(result?.error || 'Login failed');
      }
      
      // Reset security attempts on successful login
      resetAttempts();
      
      toast.success(t('auth.login.success'));
      navigate(from === '/login' || from === '/register' ? '/' : from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      
      // Record failed attempt
      recordFailedAttempt();
      
      // Handle specific error cases
      if (error.message?.includes('email') || error.message?.includes('password')) {
        const msg = t('login.invalidCredentials');
        setError('root', { message: msg });
        toast.error(msg);
      } else if (error.message?.includes('verified')) {
        const msg = t('login.emailNotVerified');
        setError('root', { message: msg });
        toast.error(msg);
      } else if (error.message?.includes('locked')) {
        const msg = t('login.accountLocked');
        setError('root', { message: msg });
        toast.error(msg);
      } else if (error.message?.includes('rate limit')) {
        const msg = t('login.rateLimitExceeded');
        setError('root', { message: msg });
        toast.error(msg);
      } else {
        const msg = t('login.genericError');
        setError('root', { message: msg });
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [login, rememberMe, navigate, from, clearErrors, setError, canProceed, isAccountLocked, recordFailedAttempt, resetAttempts, validateInput, t]);


  // Get logo path based on theme
  const getLogoPath = () => {
    return isDark ? '/Logo Darkmode.png' : '/Logo Lightmode.png';
  };

  // Format lockout time
  const formatLockoutTime = (time) => {
    const minutes = Math.ceil((time - Date.now()) / (1000 * 60));
    return minutes > 0 ? minutes : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Seo
        title={tSeo('seo.login.title', 'Login - DentalKit')}
        description={tSeo('seo.login.description', 'Sign in to your DentalKit account to access professional dental equipment and supplies')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={isDark ? '#0B1220' : '#FFFFFF'}
      />
      
      <div className="min-h-screen flex">
        {/* Left Section - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>
          
          <div className="relative z-10 w-full flex flex-col justify-center items-center text-center p-8 xl:p-12 text-white">
            <AnimatedSection animation="fadeInUp" delay={0}>
              <div className="mb-8 max-w-lg">
                <img
                  src={getLogoPath()}
                  alt="DentalKit Logo"
                  className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl"
                  loading="eager"
                />
                <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                  {t('brand.name')}
                </h1>
                <p className="text-xl xl:text-2xl text-blue-100 leading-relaxed">
                  {t('brand.tagline')}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="grid grid-cols-2 gap-4 xl:gap-6 max-w-lg">
                <div className="text-center p-4 xl:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                  <ShieldCheckIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-yellow-400" />
                  <div className="text-2xl xl:text-3xl font-bold">100%</div>
                  <div className="text-sm xl:text-base text-blue-100 font-medium">Secure</div>
                </div>
                <div className="text-center p-4 xl:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                  <TruckIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-green-400" />
                  <div className="text-2xl xl:text-3xl font-bold">24/7</div>
                  <div className="text-sm xl:text-base text-blue-100 font-medium">Support</div>
                </div>
                <div className="text-center p-4 xl:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                  <StarIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-purple-400" />
                  <div className="text-2xl xl:text-3xl font-bold">5★</div>
                  <div className="text-sm xl:text-base text-blue-100 font-medium">Rating</div>
                </div>
                <div className="text-center p-4 xl:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                  <UserGroupIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-pink-400" />
                  <div className="text-2xl xl:text-3xl font-bold">10K+</div>
                  <div className="text-sm xl:text-base text-blue-100 font-medium">Users</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-md xl:max-w-lg">
            {/* Mobile Logo */}
            <AnimatedSection animation="fadeInDown" delay={0} className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-xl">
                <img
                  src={getLogoPath()}
                  alt="DentalKit Logo"
                  className="w-16 h-16 mx-auto mb-4 drop-shadow-md"
                  loading="eager"
                />
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t('brand.name')}
                </h1>
                <p className="text-sm sm:text-base text-blue-100">
                  {t('brand.tagline')}
                </p>
              </div>
              
              {/* Mobile Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">100%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Secure</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <TruckIcon className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">24/7</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Support</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <StarIcon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">5★</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Rating</div>
                </div>
                <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <UserGroupIcon className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Users</div>
                </div>
              </div>
            </AnimatedSection>

            {/* Login Form Container */}
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LockClosedIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('login.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {t('login.tagline')}
                  </p>
                </div>

                {/* Account Lockout Warning */}
                {isAccountLocked && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          {t('common.accountTemporarilyLocked')}
                        </p>
                        {lockoutTime && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {t('common.tryAgainIn', { time: `${formatLockoutTime(lockoutTime)} minutes` })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" noValidate>
                  {/* Email Field */}
                  <div>
                    <Input
                      label={t('login.email')}
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      {...register('email')}
                      error={errors.email?.message}
                      leftIcon={<EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      fullWidth
                      disabled={isAccountLocked || isSubmitting}
                      autoComplete="email"
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <Input
                      label={t('login.password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.passwordPlaceholder')}
                      {...register('password')}
                      error={errors.password?.message}
                      leftIcon={<LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      }
                      fullWidth
                      disabled={isAccountLocked || isSubmitting}
                      autoComplete="current-password"
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isAccountLocked || isSubmitting}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        {t('login.rememberMe')}
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      {t('login.forgotPassword')}
                    </Link>
                  </div>

                  {/* Security Check Indicator */}
                  {securityCheck && !isAccountLocked && (
                    <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {t('common.securityCheckPassed')}
                      </span>
                    </div>
                  )}

                  {/* Error Message */}
                  {errors.root && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-700 dark:text-red-300">{errors.root.message}</p>
                    </div>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    disabled={!isValid || isAccountLocked || isSubmitting || !canProceed}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        <span>{t('login.signingIn')}</span>
                      </div>
                    ) : (
                      <span>{t('login.signIn')}</span>
                    )}
                  </Button>
                </form>

                {/* Registration Link */}
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('login.noAccount')}{' '}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
                    >
                      {t('login.register')}
                    </Link>
                  </p>
                </div>

                {/* Security Notice */}
                <div className="mt-3 sm:mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('login.securityNotice')}{' '}
                    <Link to="/terms" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {t('common.termsOfService')}
                    </Link>{' '}
                    {t('common.and')}{' '}
                    <Link to="/privacy" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {t('common.privacyPolicy')}
                    </Link>
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;