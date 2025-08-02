import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon
} from '@heroicons/react/24/outline';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { currentTheme } = useTheme();

  const getLogoPath = () => {
    if (currentTheme === 'dark') {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img
                src={getLogoPath()}
                alt="DentalKit Logo"
                className="w-14 h-14 mr-4"
              />
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  {t('brand.name')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Professional Dental Supplies
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg leading-relaxed">
              {t('brand.tagline')} We provide cutting-edge dental equipment and premium supplies that elevate your practice to new heights of excellence.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <PhoneIcon className="w-5 h-5 mr-3 text-teal-600 dark:text-teal-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <EnvelopeIcon className="w-5 h-5 mr-3 text-teal-600 dark:text-teal-400" />
                <span>info@dentalkit.com</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPinIcon className="w-5 h-5 mr-3 text-teal-600 dark:text-teal-400" />
                <span>123 Dental Street, Medical District, NY 10001</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110">
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Blog & News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('footer.support')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/help" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-teal-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Subscribe to our newsletter for the latest dental industry news and exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-teal">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                © {new Date().getFullYear()} {t('brand.name')}. {t('footer.allRightsReserved')}
              </p>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher variant="dropdown" size="sm" showFlags={true} showNames={false} />
                <ThemeToggle variant="toggle" size="sm" />
              </div>
            </div>
            <div className="flex space-x-6">
              <Link 
                to="/privacy" 
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm transition-colors"
              >
                {t('footer.privacy')}
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm transition-colors"
              >
                {t('footer.terms')}
              </Link>
              <Link 
                to="/sitemap" 
                className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 