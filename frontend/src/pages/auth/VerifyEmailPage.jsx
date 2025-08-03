import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', null

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Get logo path based on theme
  const getLogoPath = useCallback(() => {
    if (isDark()) {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  }, [isDark]);

  useEffect(() => {
    if (token && email) {
      verifyEmail();
    } else {
      setVerificationStatus('error');
    }
  }, [token, email]);

  const verifyEmail = async () => {
    setIsVerifying(true);
    try {
      await api.get('/auth/verify-email', {
        params: { token, email }
      });
      setVerificationStatus('success');
      toast.success(t('auth.verifyEmail.success.title'));
    } catch (error) {
      setVerificationStatus('error');
      toast.error(error.response?.data?.message || t('auth.verifyEmail.error.message'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    if (token && email) {
      verifyEmail();
    }
  };

  if (isVerifying) {
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
                <span>Email Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <LockClosedIcon className="w-5 h-5" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Loading */}
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

            {/* Loading Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('auth.verifyEmail.verifying')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('auth.verifyEmail.verifyingText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
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
                <span>{t('auth.verifyEmail.success.title')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <LockClosedIcon className="w-5 h-5" />
                <span>{t('auth.common.sslEncrypted')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Success */}
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

            {/* Success Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('auth.verifyEmail.success.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('auth.verifyEmail.success.message')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">
                    {t('auth.verifyEmail.success.whatNext')}:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.verifyEmail.success.step1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.verifyEmail.success.step2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.verifyEmail.success.step3')}
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {t('auth.verifyEmail.success.login')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
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
                <span>Email Verification</span>
              </div>
              <div className="flex items-center space-x-2">
                <LockClosedIcon className="w-5 h-5" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Error */}
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

            {/* Error Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/20 rounded-full">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('auth.verifyEmail.error.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('auth.verifyEmail.error.message')}
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 dark:text-red-100 mb-3">
                    {t('auth.verifyEmail.error.possibleReasons')}:
                  </h3>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.verifyEmail.error.reason1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.verifyEmail.error.reason2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('auth.verifyEmail.error.reason3')}
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {token && email && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="lg"
                      fullWidth
                      className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900/20"
                    >
                      {t('auth.verifyEmail.error.retry')}
                    </Button>
                  )}

                  <Button
                    onClick={() => navigate('/verify-email-sent', { state: { email } })}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {t('auth.verifyEmail.error.resend')}
                  </Button>

                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="lg"
                    fullWidth
                    className="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                  >
                    {t('auth.verifyEmail.error.backToLogin')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmailPage; 