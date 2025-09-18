import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const ContactPage = () => {
  const { t } = useTranslation('ecommerce');
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.contact.title')} description={t('seo.contact.description')} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.contact.title')}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t('pages.contact.subtitle')}</p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={150} className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
              <PhoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-300">{t('pages.contact.phone')}</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{t('footer.phone')}</p>
            </div>
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
              <EnvelopeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-300">{t('pages.contact.email')}</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{t('footer.email')}</p>
            </div>
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
              <MapPinIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-300">{t('pages.contact.address')}</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{t('footer.address')}</p>
            </div>
          </div>
          <div className="rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg mt-6">
            <p className="text-gray-700 dark:text-gray-200">{t('pages.contact.description')}</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('pages.contact.hours')}: {t('pages.contact.hoursValue')}</p>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-700/40">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sales</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Product consultations, quotes, and bulk orders.</p>
              </div>
              <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-700/40">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Order status, returns, warranty, and account issues.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ContactPage;


