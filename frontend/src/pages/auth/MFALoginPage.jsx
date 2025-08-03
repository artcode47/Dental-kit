import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ShieldCheckIcon, 
  ArrowLeftIcon,
  ArrowRightIcon,
  LockClosedIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const MFALoginPage = () => {
  const { t } = useTranslation();
  const { verifyMFA } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();
  const [mfaCode, setMfaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = location.state?.email || '';
  const from = location.state?.from || '/dashboard';

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
    mfaCode: yup
      .string()
      .required(t('validation.mfaCode.required'))
      .length(6, t('validation.mfaCode.length'))
      .matches(/^\d{6}$/, t('validation.mfaCode.numeric'))
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
      mfaCode: ''
    }
  });

  const onSubmit = useCallback(async (data) => {
    if (isSubmitting || !canProceed) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      // Sanitize input
      const sanitizedCode = sanitizeInput(data.mfaCode, 'text');

      // Validate sanitized input
      const codeValidation = validateInput(sanitizedCode, {
        required: true,
        minLength: 6,
        maxLength: 6,
        pattern: /^\d{6}$/
      });

      if (!codeValidation.isValid) {
        setError('mfaCode', { type: 'manual', message: codeValidation.error });
        throw new Error(codeValidation.error);
      }

      const mfaResult = await verifyMFA(sanitizedCode);
      toast.success(t('mfa.success'));
      
      // Check user role and redirect accordingly
      if (mfaResult.user?.role === 'admin') {
        // Redirect admin users to admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        // Redirect to the intended page
        window.location.href = from;
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      
      if (error.response?.status === 400) {
        setError('mfaCode', { 
          type: 'manual', 
          message: t('mfa.invalidCode') 
        });
        toast.error(t('mfa.invalidCode'));
      } else if (error.response?.status === 429) {
        toast.error(t('mfa.rateLimitExceeded'));
      } else {
        toast.error(t('mfa.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [verifyMFA, isSubmitting, canProceed, from, setError, clearErrors, t, sanitizeInput, validateInput]);

  // Get logo path based on theme
  const getLogoPath = useCallback(() => {
    if (isDark()) {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  }, [isDark]);

  // Handle key press for form submission
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && mfaCode.length === 6 && !isSubmitting && canProceed) {
      handleSubmit(onSubmit)();
    }
  }, [mfaCode.length, isSubmitting, canProceed, handleSubmit, onSubmit]);

  // Form reset on unmount
  React.useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

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
              alt={t('brand.name')}
              className="w-24 h-24 mx-auto mb-6 filter brightness-0 invert"
              loading="eager"
            />
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              {t('brand.name')}
            </h1>
          </div>
          
          <div className="space-y-4 text-lg leading-relaxed">
            <p className="font-medium">
              {t('auth.common.trustedPartner')}
            </p>
            <p className="opacity-90">
              {t('auth.common.streamlinePractice')}
            </p>
          </div>
          
          {/* Security badges */}
          <div className="mt-12 flex justify-center space-x-6 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>{t('auth.mfa.twoFactorAuth')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="w-5 h-5" />
              <span>{t('auth.common.sslEncrypted')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - MFA Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo for smaller screens */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={getLogoPath()}
              alt={t('brand.name')}
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
                  {t('auth.mfa.title')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('auth.mfa.tagline')}
              </p>
              {email && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('auth.mfa.forEmail')}: {email}
                </p>
              )}
            </div>

            {/* MFA Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
              noValidate
              autoComplete="off"
            >
              {/* MFA Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('auth.mfa.authenticationCode')}
                </label>
                <div className="flex space-x-3 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="w-14 h-14 text-center text-xl font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      value={mfaCode[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        if (value.length <= 1) {
                          const newCode = mfaCode.split('');
                          newCode[index] = value;
                          const updatedCode = newCode.join('');
                          setMfaCode(updatedCode);
                          
                          // Auto-focus next input
                          if (value && index < 5) {
                            e.target.nextElementSibling?.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
                          e.target.previousElementSibling?.focus();
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                  ))}
                </div>
                {errors.mfaCode && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                    {errors.mfaCode.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={mfaCode.length !== 6 || isSubmitting || !canProceed}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('auth.mfa.verifyingCode')}
                  </div>
                ) : (
                  t('auth.mfa.verifyCode')
                )}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-8 space-y-6">
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <h3 className="font-medium text-teal-900 dark:text-teal-100 mb-3 flex items-center">
                  <KeyIcon className="w-4 h-4 mr-2" />
                  {t('auth.mfa.instructions.title')}
                </h3>
                <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {t('auth.mfa.instructions.step1')} (Google Authenticator, Authy, etc.)
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {t('auth.mfa.instructions.step2')}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {t('auth.mfa.instructions.step3')}
                  </li>
                </ul>
              </div>

              <Link to="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  fullWidth
                  className="flex items-center justify-center text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  {t('auth.mfa.backToLogin')}
                </Button>
              </Link>
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('auth.mfa.codeExpiresIn')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFALoginPage; 