import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuth();
  const { isRTL } = useLanguage();
  const { currentTheme, isDark } = useTheme();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security hook
  const {
    checkRateLimit,
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
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: ''
    }
  });

  // Watch form values
  const watchedValues = watch();

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
      toast.success(t('forgotPassword.success'));
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response?.status === 404) {
        setError('email', { 
          type: 'manual', 
          message: t('forgotPassword.emailNotFound') 
        });
        toast.error(t('forgotPassword.emailNotFound'));
      } else if (error.response?.status === 429) {
        toast.error(t('forgotPassword.rateLimitExceeded'));
      } else if (error.response?.status === 400) {
        setError('email', { 
          type: 'manual', 
          message: t('forgotPassword.invalidEmail') 
        });
        toast.error(t('forgotPassword.invalidEmail'));
      } else {
        toast.error(t('forgotPassword.genericError'));
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
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Left Section - Branding/Marketing */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-500 to-teal-600 items-center justify-center p-8 relative overflow-hidden">
          {/* Background pattern for visual interest */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
          </div>
          
          <div className="text-center text-white relative z-10 max-w-md">
            <div className="mb-8">
              <img
                src={getLogoPath()}
                alt="DentalKit Logo"
                className="w-24 h-24 mx-auto mb-6 filter brightness-0 invert"
                loading="eager"
              />
              <h1 className="text-5xl font-bold mb-4 tracking-tight">
                DentalKit
              </h1>
            </div>
            
            <div className="space-y-4 text-lg leading-relaxed">
              <p className="font-medium">
                Your trusted partner for modern dental supplies.
              </p>
              <p className="opacity-90">
                Streamline your practice with our innovative solutions.
              </p>
            </div>
            
            {/* Security badges */}
            <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Secure Reset</span>
              </div>
              <div className="flex items-center space-x-2">
                <LockClosedIcon className="w-5 h-5" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Success Message */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo for smaller screens */}
            <div className="lg:hidden text-center mb-8">
              <img
                src={getLogoPath()}
                alt="DentalKit Logo"
                className="w-16 h-16 mx-auto mb-4"
                loading="eager"
              />
            </div>

            {/* Success Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/20 rounded-full">
                  <EnvelopeIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Check Your Email
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We've sent password reset instructions to your email address.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">
                    What to do next:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Check your email inbox (and spam folder)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Click the reset link in the email
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Create a new password
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
                  Try Another Email
                </Button>

                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    className="flex items-center justify-center text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Login
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
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Section - Branding/Marketing */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-500 to-teal-600 items-center justify-center p-8 relative overflow-hidden">
        {/* Background pattern for visual interest */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="text-center text-white relative z-10 max-w-md">
          <div className="mb-8">
            <img
              src={getLogoPath()}
              alt="DentalKit Logo"
              className="w-24 h-24 mx-auto mb-6 filter brightness-0 invert"
              loading="eager"
            />
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              DentalKit
            </h1>
          </div>
          
          <div className="space-y-4 text-lg leading-relaxed">
            <p className="font-medium">
              Your trusted partner for modern dental supplies.
            </p>
            <p className="opacity-90">
              Streamline your practice with our innovative solutions.
            </p>
          </div>
          
          {/* Security badges */}
          <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Secure Reset</span>
            </div>
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="w-5 h-5" />
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo for smaller screens */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={getLogoPath()}
              alt="DentalKit Logo"
              className="w-16 h-16 mx-auto mb-4"
              loading="eager"
            />
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-3">
                <ArrowRightIcon className="w-6 h-6 text-teal-500 mr-2" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Forgot Password?
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your email to receive reset instructions
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
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                {...register('email')}
                error={errors.email?.message}
                leftIcon={<UserIcon />}
                fullWidth
                disabled={isSubmitting}
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                onKeyPress={handleKeyPress}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!isValid || isSubmitting || !canProceed}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
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
                Back to Login
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll send you a secure link to reset your password. 
                The link will expire in 1 hour for your security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 