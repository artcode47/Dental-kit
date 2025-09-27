import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Seo from '../../components/seo/Seo';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AnimatedSection from '../../components/animations/AnimatedSection';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
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

const VerifyEmailPage = () => {
  const { t } = useTranslation('auth');
  const { t: tSeo } = useTranslation('ecommerce');
  const { isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', 'expired', null
  const [errorType, setErrorType] = useState(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Get logo path based on theme
  const getLogoPath = useCallback(() => getThemeLogoPath(isDark), [isDark]);

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
      toast.success(t('verifyEmail.success.title'));
    } catch (error) {
      const errorData = error.response?.data;
      const errorType = errorData?.errorType;
      
      if (errorType === 'TOKEN_EXPIRED') {
        setVerificationStatus('expired');
        setErrorType('TOKEN_EXPIRED');
        toast.error(t('verifyEmail.tokenExpired'));
      } else {
        setVerificationStatus('error');
        setErrorType(errorType || 'VERIFICATION_FAILED');
        toast.error(errorData?.message || t('verifyEmail.genericError'));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    if (token && email) {
      verifyEmail();
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error(t('auth.verifyEmail.noEmail'));
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success(t('auth.verifyEmail.resendSuccess'));
      // Navigate to the verification sent page
      navigate('/verify-email-sent', { state: { email } });
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('auth.verifyEmail.resendError');
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
        <Seo {...buildAuthSeo({ tSeo, kind: 'verifyEmail', isDark, currentLanguage })} />
        
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

        {/* Right Section - Loading */}
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

            {/* Loading Container */}
              <AnimatedSection animation="fadeInUp" delay={200}>
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50" role="status" aria-live="polite">
              <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <LoadingSpinner size="lg" className="text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('verifyEmail.verifying')}
                </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {t('verifyEmail.verifyingText')}
                </p>
              </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
        <Seo {...buildAuthSeo({ tSeo, kind: 'verifyEmail', isDark, currentLanguage })} />
        
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
                    <CheckCircleIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-green-400" />
                    <div className="text-2xl xl:text-3xl font-bold">✓</div>
                    <div className="text-sm xl:text-base text-blue-100 font-medium">Verified</div>
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

        {/* Right Section - Success */}
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
              </AnimatedSection>

              {/* Success Container */}
              <AnimatedSection animation="fadeInUp" delay={200}>
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50" role="alert" aria-live="assertive">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('verifyEmail.success.title')}
                </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {t('verifyEmail.success.message')}
                </p>
              </div>

              <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 text-sm sm:text-base">
                    {t('verifyEmail.success.whatNext')}:
                  </h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('verifyEmail.success.step1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('verifyEmail.success.step2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('verifyEmail.success.step3')}
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  fullWidth
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                      {t('verifyEmail.success.loginNow')}
                </Button>
              </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expired state
  if (verificationStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
        <Seo {...buildAuthSeo({ tSeo, kind: 'verifyEmail', isDark, currentLanguage })} />
        
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
                    <ExclamationTriangleIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-orange-400" />
                    <div className="text-2xl xl:text-3xl font-bold">!</div>
                    <div className="text-sm xl:text-base text-blue-100 font-medium">Expired</div>
                  </div>
                  <div className="text-center p-4 xl:p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300">
                    <EnvelopeIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-blue-400" />
                    <div className="text-2xl xl:text-3xl font-bold">New</div>
                    <div className="text-sm xl:text-base text-blue-100 font-medium">Email</div>
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
              </div>
              </AnimatedSection>
          </div>
        </div>

        {/* Right Section - Token Expired */}
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
              </AnimatedSection>

              {/* Token Expired Container */}
              <AnimatedSection animation="fadeInUp" delay={200}>
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50" role="alert" aria-live="assertive">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <ExclamationTriangleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('verifyEmail.tokenExpired')}
                </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      {t('verifyEmail.tokenExpiredMessage')}
                </p>
              </div>

              <div className="space-y-6">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 text-sm sm:text-base">
                        {t('verifyEmail.whatToDo')}:
                  </h3>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {t('verifyEmail.step1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {t('verifyEmail.step2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {t('verifyEmail.step3')}
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    size="lg"
                    fullWidth
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        {isResending ? (
                          <div className="flex items-center justify-center">
                            <LoadingSpinner size="sm" className="mr-2" />
                            <span>{t('verifyEmail.sending')}</span>
                          </div>
                        ) : (
                          <span>{t('verifyEmail.resend')}</span>
                        )}
                  </Button>

                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="lg"
                    fullWidth
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                        {t('verifyEmail.backToLogin')}
                  </Button>
                </div>
              </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
        <Seo
          title={tSeo('verifyEmail.error.seoTitle', 'Verification Error - DentalKit')}
          description={tSeo('verifyEmail.error.seoDescription', 'There was an error verifying your email. Please try again.')}
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
                    <ExclamationTriangleIcon className="w-8 h-8 xl:w-10 xl:h-10 mx-auto mb-3 text-red-400" />
                    <div className="text-2xl xl:text-3xl font-bold">!</div>
                    <div className="text-sm xl:text-base text-blue-100 font-medium">Error</div>
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

        {/* Right Section - Error */}
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
              </AnimatedSection>

              {/* Error Container */}
              <AnimatedSection animation="fadeInUp" delay={200}>
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 xl:p-10 border border-white/20 dark:border-gray-700/50">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <ExclamationTriangleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('verifyEmail.genericError')}
                </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      {t('verifyEmail.errorMessage')}
                </p>
              </div>

              <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 text-sm sm:text-base">
                        {t('verifyEmail.possibleReasons')}:
                  </h3>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {t('verifyEmail.reason1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {t('verifyEmail.reason2')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {t('verifyEmail.reason3')}
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
                          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 border-2 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                          {t('verifyEmail.retry')}
                    </Button>
                  )}

                  <Button
                    onClick={() => navigate('/verify-email-sent', { state: { email } })}
                    size="lg"
                    fullWidth
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                        {t('verifyEmail.resend')}
                  </Button>

                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="lg"
                    fullWidth
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                        {t('verifyEmail.backToLogin')}
                  </Button>
                </div>
              </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmailPage; 
