import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';

const TermsPage = () => {
  const { t } = useTranslation('ecommerce');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.terms.title')} description={t('seo.terms.description')} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.terms.title')}
          </h1>
        </AnimatedSection>
        <AnimatedSection animation="fadeInUp" delay={150} className="mt-8">
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <p>{t('pages.terms.intro')}</p>
            <h3>{t('pages.terms.sections.use')}</h3>
            <ul>
              <li>No reverse engineering, scraping, or circumventing security</li>
              <li>No illegal, harmful, or infringing use of our services</li>
              <li>Respect rate limits and fair‑use policies</li>
            </ul>
            <h3>{t('pages.terms.sections.purchases')}</h3>
            <ul>
              <li>Subject to availability, pricing, and verification</li>
              <li>Taxes and duties calculated at checkout where applicable</li>
              <li>Title passes upon delivery; risk of loss as per carrier terms</li>
            </ul>
            <h3>{t('pages.terms.sections.legal')}</h3>
            <ul>
              <li>Governing law and dispute resolution details</li>
              <li>Limitation of liability and warranty disclaimers</li>
              <li>Changes to terms with reasonable notice</li>
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default TermsPage;


