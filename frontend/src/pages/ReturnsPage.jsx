import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';
import StaggeredAnimation from '../components/animations/StaggeredAnimation';

const ReturnsPage = () => {
  const { t } = useTranslation('ecommerce');

  const steps = ['start', 'pack', 'ship'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.returns.title')} description={t('seo.returns.description')} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.returns.title')}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t('pages.returns.subtitle')}</p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={150} className="mt-8">
          <div className="rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
            <p className="text-gray-800 dark:text-gray-100">{t('pages.returns.policy')}</p>
            <StaggeredAnimation className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {steps.map((s) => (
                <div key={s} className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700/40">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{t(`pages.returns.steps.${s}`)}</p>
                </div>
              ))}
            </StaggeredAnimation>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl p-4 bg-white/70 dark:bg-gray-800/70 shadow">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Eligibility</h3>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-200 list-disc pl-4 space-y-1">
                  <li>Unopened consumables within 30 days</li>
                  <li>Equipment in like‑new condition with all accessories</li>
                  <li>Defective items covered under warranty</li>
                </ul>
              </div>
              <div className="rounded-xl p-4 bg-white/70 dark:bg-gray-800/70 shadow">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Refunds</h3>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-200 list-disc pl-4 space-y-1">
                  <li>Processed to original payment method</li>
                  <li>Allow 5–10 business days after inspection</li>
                  <li>Shipping fees non‑refundable unless due to our error</li>
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default ReturnsPage;


