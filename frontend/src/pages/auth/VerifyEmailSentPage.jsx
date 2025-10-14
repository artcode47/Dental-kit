import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Seo from '../../components/seo/Seo';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AnimatedSection from '../../components/animations/AnimatedSection';
import { 
  EnvelopeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TruckIcon,
  UserGroupIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import { buildAuthSeo } from '../../utils/seo';
import { getLogoPath as getThemeLogoPath } from '../../utils/themeAssets';

const VerifyEmailSentPage = () => {
  const { t } = useTranslation('auth');
  const { t: tSeo } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  const email = location.state?.email || '';

  // Get logo path based on theme
  const getLogoPath = useCallback(() => getThemeLogoPath(isDark), [isDark]);

  const handleResendEmail = useCallback(async () => {
    if (!email) {
      toast.error(t('verifyEmailSent.noEmail'));
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success(t('verifyEmailSent.resendSuccess'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('verifyEmailSent.resendError'));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Seo {...buildAuthSeo({ tSeo, kind: 'verifyEmail', isDark, currentLanguage })} />
      
      <div className="min-h-screen flex">
        {/* Left Section - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-500 to-sky-600">
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
                  <EnvelopeIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-blue-400" />
                  <div className="text-2xl xl:text-3xl font-bold">✓</div>
                  <div className="text-sm xl:text-base text-blue-100 font-medium">Sent</div>
                </div>
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
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Right Section - Email Sent */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-md xl:max-w-lg">
            {/* Mobile Logo */}
            <AnimatedSection animation="fadeInDown" delay={0} className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-sky-600 rounded-2xl p-6 mb-6 shadow-xl">
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
                  <EnvelopeIcon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">✓</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Sent</div>
                </div>
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
              </div>
            </AnimatedSection>

            {/* Email Sent Container */}
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50" role="status" aria-live="polite">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <EnvelopeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('verifyEmailSent.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {t('verifyEmailSent.message')}
                  </p>
                  {email && (
                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mt-2">
                      {maskEmail(email)}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-sm sm:text-base">
                      {t('verifyEmailSent.whatToDo')}:
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('verifyEmailSent.step1')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('verifyEmailSent.step2')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('verifyEmailSent.step3')}
                      </li>
                    </ul>
                  </div>

                  {/* Spam Warning */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center text-sm sm:text-base">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      {t('verifyEmailSent.checkSpam')}
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {t('verifyEmailSent.checkSpam')}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      size="lg"
                      fullWidth
                      loading={isResending}
                      disabled={!email}
                      className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      {isResending ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          <span>{t('verifyEmailSent.resending')}</span>
                        </div>
                      ) : (
                        <span>{t('verifyEmailSent.resendEmail')}</span>
                      )}
                    </Button>

                    <Button
                      onClick={() => navigate('/login')}
                      size="lg"
                      fullWidth
                      className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      {t('verifyEmailSent.backToLogin')}
                    </Button>
                  </div>
                </div>

                {/* Help Section */}
                <div className="mt-6 sm:mt-8 text-center">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {t('verifyEmailSent.didntReceive')}{' '}
                    <button
                      onClick={() => navigate('/contact')}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors duration-200"
                    >
                      {t('verifyEmailSent.contactSupport')}
                    </button>
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

export default VerifyEmailSentPage;
