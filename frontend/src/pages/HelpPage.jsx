import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';
import StaggeredAnimation from '../components/animations/StaggeredAnimation';

const HelpPage = () => {
  const { t } = useTranslation('ecommerce');

  const sections = [
    { key: 'orders', color: 'from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-700/40' },
    { key: 'shipping', color: 'from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-700/40' },
    { key: 'returns', color: 'from-teal-50 to-teal-100 dark:from-gray-700 dark:to-gray-700/40' },
    { key: 'account', color: 'from-amber-50 to-amber-100 dark:from-gray-700 dark:to-gray-700/40' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.help.title')} description={t('seo.help.description')} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.help.title')}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t('pages.help.subtitle')}</p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={150} className="mt-10">
          <StaggeredAnimation className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((s) => (
              <div key={s.key} className={`rounded-2xl p-6 bg-gradient-to-br ${s.color} shadow-lg`}>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{t(`pages.help.sections.${s.key}`)}</p>
                <ul className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-2 list-disc pl-4">
                  {s.key === 'orders' && (
                    <>
                      <li>Accepted payment methods and security</li>
                      <li>How to apply coupons and gift cards</li>
                      <li>Invoice and VAT details</li>
                    </>
                  )}
                  {s.key === 'shipping' && (
                    <>
                      <li>Tracking numbers and delivery windows</li>
                      <li>Damaged or missing items procedure</li>
                      <li>International shipping restrictions</li>
                    </>
                  )}
                  {s.key === 'returns' && (
                    <>
                      <li>Items eligible for return</li>
                      <li>Refund timelines and methods</li>
                      <li>Exchange and replacement policy</li>
                    </>
                  )}
                  {s.key === 'account' && (
                    <>
                      <li>Password reset and 2FA</li>
                      <li>Managing addresses and preferences</li>
                      <li>Privacy and data requests</li>
                    </>
                  )}
                </ul>
              </div>
            ))}
          </StaggeredAnimation>
        </AnimatedSection>
        
        <AnimatedSection animation="fadeInUp" delay={250} className="mt-10">
          <div className="rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">FAQs</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">How do I track my order?</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Find the tracking link in your order confirmation email or Orders page.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Can I modify an order?</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Edits are possible before dispatch. Contact support for assistance.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Do you offer bulk discounts?</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Yes—contact our sales team for tailored quotes on volume orders.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">What warranty is included?</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">Most equipment includes 12–24 months coverage. See Warranty page.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default HelpPage;


