import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';
import AnimatedSection from '../animations/AnimatedSection';
import StaggeredAnimation from '../animations/StaggeredAnimation';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation('ecommerce');
  useLanguage();
  const { currentTheme } = useTheme();

  const getLogoPath = () => {
    if (currentTheme === 'dark') {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  };

  return (
    <footer className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 dark:from-sky-900 dark:via-blue-900 dark:to-blue-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <AnimatedSection animation="fadeInUp" className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <img
              src={getLogoPath()}
              alt="DentalKit Logo"
              className="h-8 w-auto sm:h-10 mr-4"
            />
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                {t('brand.name')}
              </h3>
              <p className="text-sm text-blue-200 dark:text-gray-300">
                {t('brand.tagline')}
              </p>
            </div>
          </div>
          <p className="text-lg text-blue-100 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            {t('footer.description')}
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-16">
          {/* Quick Links */}
          <AnimatedSection animation="fadeInUp" delay={100}>
            <div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-blue-400" />
                {t('footer.quickLinks')}
              </h4>
              <StaggeredAnimation staggerDelay={50} className="space-y-3 md:space-y-4">
                <Link 
                  to="/products" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('nav.products')}
                  </span>
                </Link>
                <Link 
                  to="/categories" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('nav.categories')}
                  </span>
                </Link>
                <Link 
                  to="/about" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('nav.about')}
                  </span>
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.contact')}
                  </span>
                </Link>
              </StaggeredAnimation>
            </div>
          </AnimatedSection>

          {/* Support */}
          <AnimatedSection animation="fadeInUp" delay={200}>
            <div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
                <HeartIcon className="w-5 h-5 mr-2 text-purple-400" />
                {t('footer.support')}
              </h4>
              <StaggeredAnimation staggerDelay={50} className="space-y-3 md:space-y-4">
                <Link 
                  to="/help" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.help')}
                  </span>
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.contact')}
                  </span>
                </Link>
                <Link 
                  to="/shipping" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.shipping')}
                  </span>
                </Link>
                <Link 
                  to="/returns" 
                  className="block text-blue-100 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.returns')}
                  </span>
                </Link>
              </StaggeredAnimation>
            </div>
          </AnimatedSection>

          {/* Legal */}
          <AnimatedSection animation="fadeInUp" delay={300}>
            <div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 mr-2 text-teal-200"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v18m0-14l7 4-7 4-7-4 7-4z"/></svg>
                {t('footer.legal')}
              </h4>
              <StaggeredAnimation staggerDelay={50} className="space-y-3 md:space-y-4">
                <Link 
                  to="/privacy" 
                  className="block text-blue-200 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.privacy')}
                  </span>
                </Link>
                <Link 
                  to="/terms" 
                  className="block text-blue-200 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.terms')}
                  </span>
                </Link>
                <Link 
                  to="/warranty" 
                  className="block text-blue-200 hover:text-white transition-colors duration-200 group"
                >
                  <span className="flex items-center group-hover:translate-x-2 transition-transform">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                    {t('footer.warranty')}
                  </span>
                </Link>
              </StaggeredAnimation>
            </div>
          </AnimatedSection>

          {/* Social & Contact */}
          <AnimatedSection animation="fadeInUp" delay={400}>
            <div>
              <h4 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 mr-2 text-pink-200"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.5 2.5 13 0 15m0-15c-2.5 2.5-2.5 13 0 15M3 12h18"/></svg>
                {t('footer.connect')}
              </h4>
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div className="flex items-center text-blue-100">
                  <PhoneIcon className="w-4 h-4 mr-3 text-pink-400" />
                  <a href="tel:+201111194483" className="text-sm hover:text-white transition-colors">+20 111 119 4483</a>
                </div>
                <div className="flex items-center text-blue-100">
                  <EnvelopeIcon className="w-4 h-4 mr-3 text-pink-400" />
                  <span className="text-sm">{t('footer.email')}</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <MapPinIcon className="w-4 h-4 mr-3 text-pink-400" />
                  <span className="text-sm">Suez, Egypt</span>
                </div>
              </div>
              <div className="flex space-x-2 md:space-x-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group hover:scale-110"
                >
                  <FaFacebook className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all duration-200 group hover:scale-110"
                >
                  <FaTwitter className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl flex items-center justify-center hover:from-pink-600 hover:to-pink-700 transition-all duration-200 group hover:scale-110"
                >
                  <FaInstagram className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all duration-200 group hover:scale-110"
                >
                  <FaLinkedin className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Bottom Section */}
        <AnimatedSection animation="fadeInUp" delay={500}>
          <div className="border-t border-blue-800/30 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <p className="text-blue-100 text-sm">
                  © {new Date().getFullYear()} {t('brand.name')}. {t('footer.allRightsReserved')}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <a 
                  href="https://www.instagram.com/artcode321/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-200 hover:text-white text-sm transition-colors group"
                >
                  <span className="flex items-center group-hover:scale-105 transition-transform">
                    Made with ❤️ by ArtCode
                  </span>
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
};

export default Footer;
