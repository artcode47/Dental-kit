import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  UserPlusIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Security hook
  const {
    isLocked: securityLocked,
    recordFailedAttempt,
    resetAttempts,
    sanitizeInput,
    validateInput,
    performSecurityCheck,
    canProceed
  } = useSecurity({
    maxAttempts: 3,
    lockoutDuration: 10 * 60 * 1000, // 10 minutes
    rateLimitWindow: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 5
  });

  // Local state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityCheck, setSecurityCheck] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  // Validation schema with enhanced security
  const schema = useMemo(() => yup.object().shape({
    email: yup
      .string()
      .required(t('validation.email.required'))
      .email(t('validation.email.invalid'))
      .max(254, t('validation.email.tooLong'))
      .trim(),
    firstName: yup
      .string()
      .required(t('validation.firstName.required'))
      .min(2, t('validation.firstName.min'))
      .max(50, t('validation.firstName.max'))
      .trim(),
    lastName: yup
      .string()
      .required(t('validation.lastName.required'))
      .min(2, t('validation.lastName.min'))
      .max(50, t('validation.lastName.max'))
      .trim(),
    phone: yup
      .string()
      .required(t('validation.phone.required'))
      .matches(/^[+]?[\d\s\-()]+$/, t('validation.phone.invalid'))
      .trim(),
    company: yup
      .string()
      .optional()
      .max(100, t('validation.company.max'))
      .trim(),
    university: yup
      .string()
      .optional()
      .max(100, t('validation.university.max'))
      .trim(),
    country: yup
      .string()
      .required(t('validation.country.required'))
      .oneOf(['EG', 'SA'], t('validation.country.invalid')),
    governorate: yup
      .string()
      .required(t('validation.governorate.required'))
      .trim(),
    password: yup
      .string()
      .required(t('validation.password.required'))
      .min(8, t('validation.password.min'))
      .max(128, t('validation.password.tooLong'))
      .matches(/[a-z]/, t('validation.password.lowercase'))
      .matches(/[A-Z]/, t('validation.password.uppercase'))
      .matches(/[0-9]/, t('validation.password.number'))
      .matches(/[^A-Za-z0-9]/, t('validation.password.symbol')),
    confirmPassword: yup
      .string()
      .required(t('validation.confirmPassword.required'))
      .oneOf([yup.ref('password'), null], t('validation.confirmPassword.match')),
    consentGiven: yup
      .boolean()
      .oneOf([true], t('validation.consent.required'))
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
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      university: '',
      country: 'EG',
      governorate: '',
      password: '',
      confirmPassword: '',
      consentGiven: false
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

  // Password strength calculation
  useEffect(() => {
    const password = watchedValues.password;
    if (!password) {
      setPasswordStrength({ score: 0, feedback: [] });
      return;
    }

    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push(t('validation.password.min'));

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push(t('validation.password.lowercase'));

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push(t('validation.password.uppercase'));

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push(t('validation.password.number'));

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push(t('validation.password.symbol'));

    setPasswordStrength({ score, feedback });
  }, [watchedValues.password, t]);

  // Enhanced form submission with security measures
  const onSubmit = useCallback(async (data) => {
    if (isSubmitting || securityLocked || !canProceed) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      // Additional client-side security checks
      if (!data.email || !data.password || !data.confirmPassword) {
        throw new Error(t('validation.allFieldsRequired'));
      }

      // Sanitize input
      const sanitizedData = {
        email: sanitizeInput(data.email, 'email'),
        password: sanitizeInput(data.password, 'password'),
        firstName: sanitizeInput(data.firstName, 'text'),
        lastName: sanitizeInput(data.lastName, 'text'),
        phone: sanitizeInput(data.phone, 'phone'),
        company: sanitizeInput(data.company, 'text'),
        university: sanitizeInput(data.university, 'text'),
        country: data.country,
        governorate: sanitizeInput(data.governorate, 'text'),
        consentGiven: data.consentGiven
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

      await registerUser(sanitizedData);
      
      // Success - reset security attempts
      resetAttempts();
      
      // Success feedback
              toast.success(t('auth.register.success'));
      
      // Navigate to email verification page
      navigate('/verify-email-sent', {
        state: { email: sanitizedData.email }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Record failed attempt
      recordFailedAttempt();
      
      // Handle specific error cases with proper user feedback
      if (error.response?.status === 409) {
          setError('email', { 
            type: 'manual', 
                      message: t('auth.register.emailAlreadyExists')
        });
        toast.error(t('auth.register.emailAlreadyExists'));
      } else if (error.response?.status === 429) {
        toast.error(t('auth.register.rateLimitExceeded'));
      } else if (error.response?.status === 500) {
        toast.error(t('auth.register.serverError'));
      } else {
        // Generic error handling
        toast.error(t('auth.register.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    registerUser, 
    navigate, 
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

  // Countries and governorates data
  const countries = [
    { code: 'EG', name: t('countries.EG') },
    { code: 'SA', name: t('countries.SA') }
  ];

  const governorates = {
    EG: [
      'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia',
      'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh',
      'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
      'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
      'South Sinai', 'Suez'
    ],
    SA: [
      'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk',
      'Abha', 'Jizan', 'Najran', 'Al Bahah', 'Al Jouf', 'Al Qassim',
      'Hail', 'Northern Borders', 'Eastern Province'
    ]
  };

  // Password strength helpers
  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    if (score <= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score <= 4) return 'text-teal-600 bg-teal-100 dark:bg-teal-900/20';
    return 'text-green-600 bg-green-100 dark:bg-green-900/20';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return t('validation.password.veryWeak');
    if (score <= 3) return t('validation.password.weak');
    if (score <= 4) return t('validation.password.medium');
    return t('validation.password.strong');
  };

  // Accessibility improvements
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && isValid && !isSubmitting && !securityLocked && canProceed) {
      handleSubmit(onSubmit)();
    }
  }, [isValid, isSubmitting, securityLocked, canProceed, handleSubmit, onSubmit]);

  // Form reset on unmount
  useEffect(() => {
    return () => {
      reset();
      setSecurityCheck(false);
    };
  }, [reset]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
                alt={t('brand.name')}
                className="w-24 h-24 object-contain filter brightness-0 invert drop-shadow-lg"
                loading="eager"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight drop-shadow-lg">
              {t('brand.name')}
            </h1>
            <p className="text-lg opacity-90 drop-shadow-md">
              {t('brand.tagline')}
            </p>
          </div>
          
          <div className="space-y-3 text-base leading-relaxed">
            <p className="font-medium drop-shadow-md">
              {t('auth.register.tagline')}
            </p>
            <p className="opacity-90 drop-shadow-md">
              {t('auth.common.streamlinePractice')}
            </p>
          </div>
          
          {/* Enhanced Security badges */}
          <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>{t('auth.common.secureRegistration')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <LockClosedIcon className="w-5 h-5" />
              <span>{t('auth.common.sslEncrypted')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo for smaller screens */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-6">
              <img
                src={getLogoPath()}
                alt={t('brand.name')}
                className="w-20 h-20 object-contain drop-shadow-md"
                loading="eager"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          </div>

          {/* Enhanced Form Container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
            {/* Enhanced Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <UserPlusIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {t('auth.register.title')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {t('auth.register.tagline')}
              </p>
            </div>

            {/* Enhanced Registration Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
              noValidate
              autoComplete="off"
            >
              {/* Enhanced Email Field */}
              <div className="space-y-2">
                <Input
                  label={t('auth.register.email')}
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  {...register('email')}
                  error={errors.email?.message}
                  leftIcon={<EnvelopeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  fullWidth
                  disabled={securityLocked || isSubmitting}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  onKeyPress={handleKeyPress}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {t('auth.register.personalInformation')}
                </h3>
                
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('auth.register.firstName')}
                    placeholder={t('auth.register.firstNamePlaceholder')}
                    {...register('firstName')}
                    error={errors.firstName?.message}
                    leftIcon={<UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                    fullWidth
                    disabled={securityLocked || isSubmitting}
                    className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  />
                  <Input
                    label={t('auth.register.lastName')}
                    placeholder={t('auth.register.lastNamePlaceholder')}
                    {...register('lastName')}
                    error={errors.lastName?.message}
                    leftIcon={<UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                    fullWidth
                    disabled={securityLocked || isSubmitting}
                    className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  />
                </div>

                {/* Phone Field */}
                <Input
                  label={t('auth.register.phone')}
                  placeholder={t('auth.register.phonePlaceholder')}
                  {...register('phone')}
                  error={errors.phone?.message}
                  leftIcon={<PhoneIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  fullWidth
                  disabled={securityLocked || isSubmitting}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />

                {/* Company and University Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('auth.register.company')}
                    placeholder={t('auth.register.companyPlaceholder')}
                    {...register('company')}
                    error={errors.company?.message}
                    leftIcon={<BuildingOfficeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                    fullWidth
                    disabled={securityLocked || isSubmitting}
                    className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  />
                  <Input
                    label={t('auth.register.university')}
                    placeholder={t('auth.register.universityPlaceholder')}
                    {...register('university')}
                    error={errors.university?.message}
                    leftIcon={<AcademicCapIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                    fullWidth
                    disabled={securityLocked || isSubmitting}
                    className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  />
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('auth.register.country')}
                    </label>
                    <select
                      {...register('country')}
                      disabled={securityLocked || isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('auth.register.governorate')}
                    </label>
                    <select
                      {...register('governorate')}
                      disabled={securityLocked || isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    >
                      <option value="">{t('auth.register.selectGovernorate')}</option>
                      {governorates[watchedValues.country]?.map(governorate => (
                        <option key={governorate} value={governorate}>
                          {governorate}
                        </option>
                      ))}
                    </select>
                    {errors.governorate && (
                      <p className="mt-1 text-sm text-error-600 dark:text-error-400">
                        {errors.governorate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-2">
                <Input
                  label={t('auth.register.password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  {...register('password')}
                  error={errors.password?.message}
                  fullWidth
                  disabled={securityLocked || isSubmitting}
                  autoComplete="new-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  leftIcon={<LockClosedIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </button>
                  }
                  onKeyPress={handleKeyPress}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />

                {/* Password Strength Indicator */}
                {watchedValues.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('auth.register.passwordStrength')}:
                      </span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPasswordStrengthColor(passwordStrength.score)}`}>
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 2 ? 'bg-red-500' :
                          passwordStrength.score <= 3 ? 'bg-yellow-500' :
                          passwordStrength.score <= 4 ? 'bg-teal-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Confirm Password Field */}
              <div className="space-y-2">
                <Input
                  label={t('auth.register.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  fullWidth
                  disabled={securityLocked || isSubmitting}
                  autoComplete="new-password"
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  leftIcon={<LockClosedIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </button>
                  }
                  onKeyPress={handleKeyPress}
                  className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />
              </div>

              {/* Enhanced Consent Checkbox */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    id="consent"
                    type="checkbox"
                    {...register('consentGiven')}
                    disabled={securityLocked || isSubmitting}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 hover:border-teal-500 transition-colors mt-1"
                  />
                  <label 
                    htmlFor="consent" 
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {t('auth.register.consentLabel')}
                  </label>
                </div>
                {errors.consentGiven && (
                  <p className="text-sm text-error-600 dark:text-error-400 ml-6">
                    {errors.consentGiven.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  {t('auth.register.consentText')}
                </p>
              </div>

              {/* Enhanced Security Check Indicator */}
              {securityCheck && !securityLocked && (
                <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {t('auth.common.securityCheckPassed')}
                  </span>
                </div>
              )}

              {/* Enhanced Register Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!isValid || securityLocked || isSubmitting || !canProceed}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('auth.register.creating')}...
                  </div>
                ) : (
                  t('auth.register.createAccount')
                )}
              </Button>
            </form>

            {/* Enhanced Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('auth.register.alreadyHaveAccount')}{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200 hover:underline"
                >
                  {t('auth.register.login')}
                </Link>
              </p>
            </div>

            {/* Enhanced Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('auth.register.securityNotice')}{' '}
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

export default RegisterPage; 