import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import SecurityCheckIndicator from '../../components/auth/SecurityCheckIndicator';
import AnimatedSection from '../../components/animations/AnimatedSection';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
// removed unused sanitizeEmail and sanitizeString imports

const RegisterPage = () => {
  const { t } = useTranslation('auth');
  const { t: tSeo } = useTranslation('ecommerce');
  const { register: registerUser } = useAuth();
  const { isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // Security hook
  const {
    isLocked: securityLocked,
    lockoutUntil: securityLockoutUntil,
    recordFailedAttempt,
    resetAttempts,
    validateInput,
    performSecurityCheck,
    canProceed,
    sanitizeInput
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
    watch
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

  // Ensure stable reference to performSecurityCheck to avoid infinite loops
  const performSecurityCheckRef = useRef(performSecurityCheck);
  useEffect(() => {
    performSecurityCheckRef.current = performSecurityCheck;
  }, [performSecurityCheck]);

  // Security check effect (debounced) - depends only on primitive values
  const emailValue = watchedValues.email;
  const formPasswordValue = watchedValues.password;
  useEffect(() => {
    if (isDirty && emailValue && formPasswordValue) {
      const timer = setTimeout(async () => {
        const securityResult = await performSecurityCheckRef.current({
          ...watchedValues,
          email: emailValue,
          password: formPasswordValue
        });
        setSecurityCheck(securityResult.passed);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDirty, emailValue, formPasswordValue, watchedValues]);

  // Password strength calculation - isolate translation access
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  const passwordValue = watchedValues.password;

  useEffect(() => {
    const password = passwordValue;
    if (!password) {
      setPasswordStrength({ score: 0, feedback: [] });
      return;
    }

    let score = 0;
    const feedback = [];
    const translate = tRef.current;

    if (password.length >= 8) score += 1; else feedback.push(translate('validation.password.min'));
    if (/[a-z]/.test(password)) score += 1; else feedback.push(translate('validation.password.lowercase'));
    if (/[A-Z]/.test(password)) score += 1; else feedback.push(translate('validation.password.uppercase'));
    if (/[0-9]/.test(password)) score += 1; else feedback.push(translate('validation.password.number'));
    if (/[^A-Za-z0-9]/.test(password)) score += 1; else feedback.push(translate('validation.password.symbol'));

    setPasswordStrength({ score, feedback });
  }, [passwordValue]);

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

      const result = await registerUser(sanitizedData);
      if (result?.success) {
        resetAttempts();
        toast.success(t('register.success'));
        navigate('/verify-email-sent', { state: { email: sanitizedData.email } });
        return;
      } else {
        // Known failure path, show message and remain on page
        if (result?.status === 409) {
          setError('email', { type: 'manual', message: t('register.emailAlreadyExists') });
        }
        return;
      }
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
        toast.error(t('register.emailAlreadyExists'));
      } else if (error.response?.status === 429) {
        toast.error(t('register.rateLimitExceeded'));
      } else if (error.response?.status === 500) {
        toast.error(t('register.serverError'));
      } else {
        // Generic error handling
        toast.error(t('register.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    registerUser,
    navigate,
    isSubmitting,
    securityLocked,
    canProceed,
    setError,
    clearErrors,
    t,
    sanitizeInput,
    validateInput,
    recordFailedAttempt,
    resetAttempts
  ]);

  // Countries and governorates data with translations
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

  // Get logo path based on theme
  const getLogoPath = () => {
    return isDark ? '/Logo Darkmode.png' : '/Logo Lightmode.png';
  };

  // Account lockout check
  const isAccountLocked = securityLocked;
  const lockoutTime = securityLockoutUntil;

  // Format lockout time
  const formatLockoutTime = (time) => {
    const minutes = Math.ceil((time - Date.now()) / (1000 * 60));
    return minutes > 0 ? minutes : 0;
  };

  // Accessibility: submit on Enter is handled natively by the form

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Seo
        title={tSeo('seo.register.title', 'Register - DentalKit')}
        description={tSeo('seo.register.description', 'Create your DentalKit account to access professional dental equipment and supplies')}
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

      {/* Right Section - Registration Form */}
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

            {/* Registration Form Container */}
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <UserPlusIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('register.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {t('register.tagline')}
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

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" noValidate>
                  {/* Email Field */}
                  <div>
                    <Input
                      label={t('register.email')}
                      type="email"
                      placeholder={t('register.emailPlaceholder')}
                      {...register('email')}
                      error={errors.email?.message}
                      leftIcon={<EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      fullWidth
                      disabled={isAccountLocked || isSubmitting}
                      autoComplete="email"
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                      {t('register.personalInformation')}
                    </h3>
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={t('register.firstName')}
                        placeholder={t('register.firstNamePlaceholder')}
                        {...register('firstName')}
                        error={errors.firstName?.message}
                        leftIcon={<UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        fullWidth
                        disabled={isAccountLocked || isSubmitting}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                      <Input
                        label={t('register.lastName')}
                        placeholder={t('register.lastNamePlaceholder')}
                        {...register('lastName')}
                        error={errors.lastName?.message}
                        leftIcon={<UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        fullWidth
                        disabled={isAccountLocked || isSubmitting}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                    </div>

                    {/* Phone Field */}
                    <Input
                      label={t('register.phone')}
                      placeholder={t('register.phonePlaceholder')}
                      {...register('phone')}
                      error={errors.phone?.message}
                      leftIcon={<PhoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      fullWidth
                      disabled={isAccountLocked || isSubmitting}
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    />

                    {/* Company and University Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label={t('register.company')}
                        placeholder={t('register.companyPlaceholder')}
                        {...register('company')}
                        error={errors.company?.message}
                        leftIcon={<BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        fullWidth
                        disabled={isAccountLocked || isSubmitting}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                      <Input
                        label={t('register.university')}
                        placeholder={t('register.universityPlaceholder')}
                        {...register('university')}
                        error={errors.university?.message}
                        leftIcon={<AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        fullWidth
                        disabled={isAccountLocked || isSubmitting}
                        className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.country')}
                        </label>
                        <select
                          {...register('country')}
                          disabled={isAccountLocked || isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        >
                          {countries.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.country.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('register.governorate')}
                        </label>
                        <select
                          {...register('governorate')}
                          disabled={isAccountLocked || isSubmitting}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        >
                          <option value="">{t('register.selectGovernorate')}</option>
                          {governorates[watchedValues.country]?.map(governorate => (
                            <option key={governorate} value={governorate}>
                              {t(`governorates.${watchedValues.country}.${governorate}`, governorate)}
                            </option>
                          ))}
                        </select>
                        {errors.governorate && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.governorate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <Input
                      label={t('register.password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('register.passwordPlaceholder')}
                      {...register('password')}
                      error={errors.password?.message}
                      fullWidth
                      disabled={isAccountLocked || isSubmitting}
                      autoComplete="new-password"
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
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    />

                    {/* Password Strength Indicator */}
                    {watchedValues.password && (
                      <PasswordStrengthIndicator 
                        strength={passwordStrength}
                        className="mt-2"
                      />
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <Input
                      label={t('register.confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      {...register('confirmPassword')}
                      error={errors.confirmPassword?.message}
                      fullWidth
                      disabled={isAccountLocked || isSubmitting}
                      autoComplete="new-password"
                      leftIcon={<LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <EyeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      }
                      className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    />
                  </div>

                  {/* Consent Checkbox */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <input
                        id="consent"
                        type="checkbox"
                        {...register('consentGiven')}
                        disabled={isAccountLocked || isSubmitting}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 hover:border-blue-500 transition-colors mt-1"
                      />
                      <label 
                        htmlFor="consent" 
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {t('register.consentLabel')}
                      </label>
                    </div>
                    {errors.consentGiven && (
                      <p className="text-sm text-red-600 dark:text-red-400 ml-6">
                        {errors.consentGiven.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                      {t('register.consentText')}
                    </p>
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

                  {/* Register Button */}
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
                        <span>{t('register.creating')}</span>
                      </div>
                    ) : (
                      <span>{t('register.createAccount')}</span>
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="mt-4 sm:mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('register.alreadyHaveAccount')}{' '}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
                    >
                      {t('register.login')}
                    </Link>
                  </p>
                </div>

                {/* Security Notice */}
                <div className="mt-3 sm:mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t('register.securityNotice')}{' '}
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

export default RegisterPage; 
