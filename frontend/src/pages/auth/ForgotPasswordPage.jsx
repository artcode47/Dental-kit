import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowLeftIcon, 
  EnvelopeIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const { isDark } = useTheme();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security hook
  const {
    sanitizeInput,
    validateInput,
    canProceed
  } = useSecurity({
    rateLimitWindow: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 5
  });

  // Validation schema
  const schema = yup.object().shape({
    email: yup
      .string()
      .required(t('validation.email.required'))
      .email(t('validation.email.invalid'))
      .max(254, t('validation.email.tooLong'))
      .trim()
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: ''
    }
  });

  // Watch form values (unused but kept for potential future use)
  // const watchedValues = watch();

  const onSubmit = useCallback(async (data) => {
    if (isSubmitting || !canProceed) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      // Sanitize input
      const sanitizedEmail = sanitizeInput(data.email, 'email');

      // Validate sanitized input
      const emailValidation = validateInput(sanitizedEmail, {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      });

      if (!emailValidation.isValid) {
        setError('email', { type: 'manual', message: emailValidation.error });
        throw new Error(emailValidation.error);
      }

      await forgotPassword(sanitizedEmail);
      setIsEmailSent(true);
      toast.success(t('auth.forgotPassword.success'));
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        setError('email', { 
          type: 'manual', 
                    message: t('auth.forgotPassword.emailNotFound')
        });
        toast.error(t('auth.forgotPassword.emailNotFound'));
      } else if (error.response?.status === 429) {
        toast.error(t('auth.forgotPassword.rateLimitExceeded'));
      } else if (error.response?.status === 400) {
        setError('email', { 
          type: 'manual', 
                      message: t('auth.forgotPassword.invalidEmail')
          });
          toast.error(t('auth.forgotPassword.invalidEmail'));
      } else {
        toast.error(t('auth.forgotPassword.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [forgotPassword, isSubmitting, canProceed, setError, clearErrors, t, sanitizeInput, validateInput]);

  // Get logo path based on theme
  const getLogoPath = useCallback(() => {
    if (isDark()) {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  }, [isDark]);

  // Handle key press for form submission
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && isValid && !isSubmitting && canProceed) {
      handleSubmit(onSubmit)();
    }
  }, [isValid, isSubmitting, canProceed, handleSubmit, onSubmit]);

  // Form reset on unmount
  React.useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Left Section - Branding/Marketing */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 items-center justify-center p-8 relative overflow-hidden">
          {/* Background pattern for visual interest */}
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
                {t('auth.common.trustedPartner')}
              </p>
              <p className="opacity-90 drop-shadow-md">
                {t('auth.common.streamlinePractice')}
              </p>
            </div>
            
            {/* Security badges */}
            <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
                          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>{t('auth.forgotPassword.secureReset')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <LockClosedIcon className="w-5 h-5" />
              <span>{t('auth.common.sslEncrypted')}</span>
            </div>
            </div>
          </div>
        </div>

        {/* Right Section - Success Message */}
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

            {/* Success Container */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full shadow-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  {t('auth.forgotPassword.emailSent.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {t('auth.forgotPassword.emailSent.message')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">
                    {t('auth.forgotPassword.emailSent.whatToDo')}
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.forgotPassword.emailSent.step1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.forgotPassword.emailSent.step2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.forgotPassword.emailSent.step3')}
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    reset();
                  }}
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900/20"
                >
                  {t('auth.forgotPassword.emailSent.tryAgain')}
                </Button>

                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    className="flex items-center justify-center text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    {t('auth.forgotPassword.emailSent.backToLogin')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Section - Branding/Marketing */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 items-center justify-center p-8 relative overflow-hidden">
        {/* Background pattern for visual interest */}
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
                {t('auth.common.trustedPartner')}
              </p>
              <p className="opacity-90 drop-shadow-md">
                {t('auth.common.streamlinePractice')}
              </p>
            </div>
          
          {/* Security badges */}
          <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>{t('auth.forgotPassword.secureReset')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              <LockClosedIcon className="w-5 h-5" />
              <span>{t('auth.common.sslEncrypted')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Forgot Password Form */}
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

          {/* Form Container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <ArrowRightIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {t('auth.forgotPassword.title')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {t('auth.forgotPassword.tagline')}
              </p>
            </div>

            {/* Forgot Password Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
              noValidate
              autoComplete="off"
            >
              {/* Email Field */}
              <Input
                label={t('auth.forgotPassword.email')}
                type="email"
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                {...register('email')}
                error={errors.email?.message}
                leftIcon={<EnvelopeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                fullWidth
                disabled={isSubmitting}
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                onKeyPress={handleKeyPress}
                className="focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!isValid || isSubmitting || !canProceed}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('auth.forgotPassword.sending')}...
                  </div>
                ) : (
                  t('auth.forgotPassword.sendResetLink')
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link 
                to="/login" 
                className="text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200 flex items-center justify-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('auth.forgotPassword.securityNotice')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 