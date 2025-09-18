import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import Seo from '../components/seo/Seo';
import AnimatedSection from '../components/animations/AnimatedSection';
import StaggeredAnimation from '../components/animations/StaggeredAnimation';

const AboutPage = () => {
  const { t } = useTranslation('ecommerce');
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <Seo title={t('seo.about.title')} description={t('seo.about.description')} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AnimatedSection animation="fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
            {t('pages.about.title')}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {t('pages.about.subtitle')}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={150} className="mt-10">
          <div className="rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
              {t('pages.about.content')}
            </p>
            <StaggeredAnimation className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700/40">
                <p className="font-semibold text-blue-700 dark:text-blue-300">{t('pages.about.highlights.quality')}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Certified sourcing, multi‑point QA, and regulatory compliance across all categories.</p>
              </div>
              <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-700 dark:to-gray-700/40">
                <p className="font-semibold text-purple-700 dark:text-purple-300">{t('pages.about.highlights.support')}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Clinical experts and product specialists available to guide purchasing decisions.</p>
              </div>
              <div className="rounded-xl p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-700 dark:to-gray-700/40">
                <p className="font-semibold text-teal-700 dark:text-teal-300">{t('pages.about.highlights.delivery')}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Optimized logistics with fast dispatch, tracking, and safe packaging.</p>
              </div>
            </StaggeredAnimation>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={250} className="mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Our Mission</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-200">Elevate dental care outcomes by democratizing access to premium equipment and education.</p>
              <ul className="mt-4 list-disc pl-5 text-gray-700 dark:text-gray-200 space-y-2">
                <li>Empower clinicians with reliable, evidence‑based product choices</li>
                <li>Shorten lead times and reduce total cost of ownership</li>
                <li>Back every purchase with responsive, specialized support</li>
              </ul>
            </div>
            <div className="rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Our Values</h2>
              <ul className="mt-2 space-y-2 text-gray-700 dark:text-gray-200">
                <li><span className="font-semibold">Integrity:</span> Transparent pricing, clear policies, and honest recommendations.</li>
                <li><span className="font-semibold">Safety:</span> Adherence to international standards and strict quality control.</li>
                <li><span className="font-semibold">Innovation:</span> Continuous improvements in catalog, content, and logistics.</li>
              </ul>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={350} className="mt-10">
          <div className="rounded-2xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Milestones</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded-xl p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">10k+</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Orders fulfilled</p>
              </div>
              <div className="rounded-xl p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">1.2k</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Clinics served</p>
              </div>
              <div className="rounded-xl p-4 text-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="text-3xl font-extrabold text-teal-700 dark:text-teal-300">48h</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Avg. dispatch time</p>
              </div>
              <div className="rounded-xl p-4 text-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-700 dark:to-gray-700/40">
                <p className="text-3xl font-extrabold text-amber-700 dark:text-amber-300">99.2%</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">On‑time delivery</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default AboutPage;


