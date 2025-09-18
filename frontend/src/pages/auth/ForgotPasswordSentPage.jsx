import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Seo from '../../components/seo/Seo';
import Button from '../../components/ui/Button';
import AnimatedSection from '../../components/animations/AnimatedSection';
import { CheckCircleIcon, EnvelopeIcon, ShieldCheckIcon, StarIcon, TruckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPasswordSentPage = () => {
  const { t } = useTranslation('auth');
  const { t: tSeo } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const passedEmail = location.state?.email;

  const getLogoPath = () => (isDark ? '/Logo Darkmode.png' : '/Logo Lightmode.png');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
      <Seo
        title={tSeo('seo.forgotPasswordSent.title', 'Email Sent - DentalKit')}
        description={tSeo('seo.forgotPasswordSent.description', 'Password reset email has been sent to your inbox')}
        type="website"
        locale={currentLanguage === 'ar' ? 'ar_SA' : 'en_US'}
        themeColor={isDark ? '#0B1220' : '#FFFFFF'}
      />

      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
            <div className="absolute inset-0 bg-black/20"></div>
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

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="w-full max-w-md xl:max-w-lg">
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
            </AnimatedSection>

            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('forgotPassword.emailSent.title')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {t('forgotPassword.emailSent.message')}
                  </p>
                  {passedEmail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{passedEmail}</p>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 text-sm sm:text-base">
                      {t('forgotPassword.emailSent.whatToDo')}:
                    </h3>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('forgotPassword.emailSent.step1')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('forgotPassword.emailSent.step2')}
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {t('forgotPassword.emailSent.step3')}
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <Link to="/forgot-password">
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        {t('forgotPassword.emailSent.tryAgain')}
                      </Button>
                    </Link>

                    <Link to="/login">
                      <Button
                        variant="ghost"
                        size="lg"
                        fullWidth
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        {t('forgotPassword.emailSent.backToLogin')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordSentPage;





