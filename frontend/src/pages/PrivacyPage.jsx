import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';

const PrivacyPage = () => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.privacy.title')} description={t('seo.privacy.description')} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.privacy.title')}
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t('pages.privacy.updated')}: 2025-09-01</p>
        </AnimatedSection>
        <AnimatedSection animation="fadeInUp" delay={150} className="mt-8">
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <h3>{t('pages.privacy.sections.data')}</h3>
            <ul>
              <li>Identification: name, email, phone</li>
              <li>Transaction: orders, payments, invoices</li>
              <li>Technical: device, browser, IP, usage analytics</li>
            </ul>
            <h3>{t('pages.privacy.sections.use')}</h3>
            <ul>
              <li>Fulfill orders and provide customer support</li>
              <li>Fraud prevention and account security</li>
              <li>Improve products, content, and website performance</li>
              <li>Marketing with consent and opt‑out controls</li>
            </ul>
            <h3>{t('pages.privacy.sections.rights')}</h3>
            <ul>
              <li>Access, rectify, or delete personal data</li>
              <li>Withdraw consent at any time</li>
              <li>Request data portability and restriction</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default PrivacyPage;


