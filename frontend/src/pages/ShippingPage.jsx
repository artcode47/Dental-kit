import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';

const ShippingPage = () => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.shipping.title')} description={t('seo.shipping.description')} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.shipping.title')}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t('pages.shipping.subtitle')}</p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={150} className="mt-8">
          <div className="rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg space-y-4">
            <p className="text-gray-800 dark:text-gray-100">{t('pages.shipping.standard')}</p>
            <p className="text-gray-800 dark:text-gray-100">{t('pages.shipping.express')}</p>
            <p className="text-gray-700 dark:text-gray-200">{t('pages.shipping.freeOver')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Packaging</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">Shock‑resistant, temperature‑aware materials for sensitive items.</p>
              </div>
              <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Tracking</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">Real‑time updates and SMS/email notifications.</p>
              </div>
              <div className="rounded-xl p-4 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Insurance</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">Optional coverage for high‑value equipment shipments.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ShippingPage;


