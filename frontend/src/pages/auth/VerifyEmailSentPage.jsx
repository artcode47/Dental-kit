import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  EnvelopeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerifyEmailSentPage = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  const email = location.state?.email || '';

  // Get logo path based on theme
  const getLogoPath = useCallback(() => {
    if (isDark()) {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  }, [isDark]);

  const handleResendEmail = useCallback(async () => {
    if (!email) {
      toast.error(t('auth.verifyEmail.sent.noEmail'));
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success(t('auth.verifyEmail.sent.resendSuccess'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.verifyEmail.sent.resendError'));
    } finally {
      setIsResending(false);
    }
  }, [email, t]);

  const maskEmail = useCallback((email) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `****@${domain}`;
    return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`;
  }, []);

  return (
    <div className="min-h-screen flex bg-light-50 dark:bg-dark-900">
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
              <span>{t('auth.verifyEmail.title')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="w-5 h-5" />
              <span>{t('auth.common.sslEncrypted')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Email Sent */}
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

          {/* Email Sent Container */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-light-200 dark:border-dark-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-teal-100 dark:bg-teal-900/20 rounded-full">
                <EnvelopeIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-dark-900 dark:text-light-100 mb-3">
                {t('auth.verifyEmail.sent.title')}
              </h2>
              <p className="text-dark-600 dark:text-light-300 mb-4">
                {t('auth.verifyEmail.sent.instructions')}
              </p>
              {email && (
                <p className="text-dark-900 dark:text-light-100 font-semibold mb-4">
                  {maskEmail(email)}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <h3 className="font-medium text-teal-900 dark:text-teal-100 mb-3">
                  {t('auth.verifyEmail.sent.whatToDo')}:
                </h3>
                <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {t('auth.verifyEmail.sent.step1')}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {t('auth.verifyEmail.sent.step2')}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {t('auth.verifyEmail.sent.step3')}
                  </li>
                </ul>
              </div>

              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
                <h3 className="font-medium text-warning-900 dark:text-warning-100 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  {t('auth.verifyEmail.sent.checkSpam')}
                </h3>
                <p className="text-sm text-warning-800 dark:text-warning-200">
                  {t('auth.verifyEmail.sent.spamInstructions')}
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  size="lg"
                  fullWidth
                  loading={isResending}
                  disabled={!email}
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900/20"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      {t('auth.verifyEmail.sent.sending')}...
                    </div>
                  ) : (
                    t('auth.verifyEmail.sent.resend')
                  )}
                </Button>

                <Button
                  onClick={() => navigate('/login')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-teal"
                >
                  {t('auth.verifyEmail.sent.backToLogin')}
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-dark-500 dark:text-light-400">
                {t('auth.verifyEmail.sent.help')}{' '}
                <button
                  onClick={() => navigate('/contact')}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  {t('auth.verifyEmail.sent.contactSupport')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailSentPage; 