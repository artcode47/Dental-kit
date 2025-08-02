import React, { useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  EyeIcon, 
  EyeSlashIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuth();
  const { isRTL } = useLanguage();
  const { currentTheme, isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Security hook
  const {
    sanitizeInput,
    validateInput,
    canProceed
  } = useSecurity({
    rateLimitWindow: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 5
  });

  // Password strength checker
  const checkPasswordStrength = useCallback((password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;
    
    return strength;
  }, []);

  // Validation schema with enhanced security
  const schema = useMemo(() => yup.object().shape({
    password: yup
      .string()
      .required(t('validation.password.required'))
      .min(8, t('validation.password.min'))
      .matches(/[a-z]/, t('validation.password.lowercase'))
      .matches(/[A-Z]/, t('validation.password.uppercase'))
      .matches(/\d/, t('validation.password.number'))
      .matches(/[@$!%*?&]/, t('validation.password.special'))
      .max(128, t('validation.password.tooLong')),
    confirmPassword: yup
      .string()
      .required(t('validation.confirmPassword.required'))
      .oneOf([yup.ref('password'), null], t('validation.confirmPassword.match'))
  }), [t]);

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
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  // Update password strength when password changes
  React.useEffect(() => {
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength);
  }, [password, checkPasswordStrength]);

  // Get strength label and color
  const getStrengthInfo = useCallback((strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' };
      case 2:
        return { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' };
      case 3:
        return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
      case 4:
        return { label: 'Strong', color: 'bg-blue-500', textColor: 'text-blue-600' };
      case 5:
        return { label: 'Very Strong', color: 'bg-green-500', textColor: 'text-green-600' };
      default:
        return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    }
  }, []);

  const strengthInfo = getStrengthInfo(passwordStrength);

  const onSubmit = useCallback(async (data) => {
    if (!token || !email || isSubmitting || !canProceed) return;

    setIsSubmitting(true);
    clearErrors();

    try {
      // Sanitize input
      const sanitizedPassword = sanitizeInput(data.password, 'password');

      // Validate sanitized input
      const passwordValidation = validateInput(sanitizedPassword, {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      });

      if (!passwordValidation.isValid) {
        setError('password', { type: 'manual', message: passwordValidation.error });
        throw new Error(passwordValidation.error);
      }

      // Check password strength
      if (passwordStrength < 4) {
        setError('password', { 
          type: 'manual', 
          message: t('validation.password.weak') 
        });
        throw new Error(t('validation.password.weak'));
      }

      await resetPassword(token, sanitizedPassword);
      setIsSuccess(true);
      toast.success(t('resetPassword.success'));
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        setError('password', { 
          type: 'manual', 
          message: t('resetPassword.invalidToken') 
        });
        toast.error(t('resetPassword.invalidToken'));
      } else if (error.response?.status === 410) {
        setError('password', { 
          type: 'manual', 
          message: t('resetPassword.tokenExpired') 
        });
        toast.error(t('resetPassword.tokenExpired'));
      } else if (error.response?.status === 429) {
        toast.error(t('resetPassword.rateLimitExceeded'));
      } else {
        toast.error(t('resetPassword.genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [token, email, isSubmitting, canProceed, resetPassword, setError, clearErrors, t, sanitizeInput, validateInput, passwordStrength]);

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

  if (isSuccess) {
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
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Password Reset Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">
                    What happens next:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Your password has been securely updated
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      All your existing sessions remain active
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You can now log in with your new password
                    </li>
                  </ul>
                </div>

                <Link to="/login">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Continue to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !email) {
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

        {/* Right Section - Error Message */}
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

            {/* Error Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded-full">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Invalid Reset Link
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  The password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <div className="space-y-6">
                <Link to="/forgot-password">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Request New Reset Link
                  </Button>
                </Link>

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

      {/* Right Section - Reset Password Form */}
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
                  Reset Password
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Create a new secure password for your account
              </p>
              {email && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  For: {email}
                </p>
              )}
            </div>

            {/* Reset Password Form */}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-6"
              noValidate
              autoComplete="off"
            >
              {/* New Password Field */}
              <div className="space-y-2">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                  error={errors.password?.message}
                  fullWidth
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  onKeyPress={handleKeyPress}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  }
                />

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                      <span className={`font-medium ${strengthInfo.textColor}`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Password must contain:</p>
                      <ul className="grid grid-cols-2 gap-1">
                        <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Lowercase letter
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Uppercase letter
                        </li>
                        <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Number
                        </li>
                        <li className={`flex items-center ${/[@$!%*?&]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Special character
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                fullWidth
                disabled={isSubmitting}
                autoComplete="new-password"
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                onKeyPress={handleKeyPress}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                }
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!isValid || isSubmitting || !canProceed || passwordStrength < 4}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
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
                This reset link will expire in 1 hour for your security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 