import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';

// A responsive, separable banner card that contains the image inside it (not a full-bleed image)
// - No animations
// - Mobile-first sizing with intrinsic image containment
// - Clear separation from page background via layered backgrounds, padding, and ring
const Banner = () => {
  const { t } = useTranslation('ecommerce');
  return (
    <section className="w-full py-6 sm:py-8 lg:py-10">
      <div className="container mx-auto px-4">
        {/* Mobile: simple card; md+: gradient frame */}
        <div className="relative isolate z-0 rounded-2xl md:rounded-3xl md:p-[2px] md:bg-gradient-to-r md:from-sky-500 md:via-sky-600 md:to-blue-700 md:shadow-[0_10px_30px_-10px_rgba(2,132,199,0.6)] overflow-visible">
          <div className="relative rounded-2xl md:rounded-[22px] bg-white dark:bg-gray-900 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
          {/* Card background to separate from page */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />

          {/* Content */}
          <div className="relative p-3 sm:p-5 lg:p-6">
            {/* Image lives inside the component, framed and centered */}
            <div className="mx-auto w-full max-w-6xl">
              <div className="rounded-xl md:rounded-2xl bg-white dark:bg-gray-800 ring-1 ring-sky-200/60 dark:ring-sky-400/20 overflow-hidden">
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[160px] sm:min-h-[220px] lg:min-h-[320px]">
                  <img
                    src="/Banner.png"
                    alt="Dental Kit banner"
                    className="w-full h-full object-cover select-none"
                    loading="eager"
                    fetchpriority="high"
                  />
                  {/* Edge color overlay (md+ only) */}
                  <div className="hidden md:block pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-600/20 via-transparent to-blue-700/20" />
                  <div className="hidden md:block pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-sky-400/10" />

                  {/* Glass header with tagline and CTA */}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between gap-2">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/80 dark:bg-gray-900/70 border border-white/60 dark:border-white/10 shadow">
                      <span className="text-[11px] sm:text-sm font-medium text-gray-800 dark:text-gray-200">{t('brand.tagline')}</span>
                    </div>
                    <Link
                      to="/products"
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] sm:text-sm font-semibold shadow hover:from-sky-600 hover:to-blue-700"
                      aria-label="Shop Now"
                    >
                      {t('home.cta.getStarted')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;


