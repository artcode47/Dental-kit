import React from 'react';
import { Helmet } from 'react-helmet-async';

export const Seo = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'DentalKit',
  locale = 'en_US',
  themeColor = '#ffffff',
  twitterCard = 'summary_large_image',
  alternates
}) => {
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const resolvedTitle = title ? `${title} | ${siteName}` : siteName;
  const autoOg = (() => {
    if (image) return image;
    if (typeof window === 'undefined') return 'https://dentalkit.com/Logo Lightmode.png';
    const u = new URL(window.location.href);
    const titleParam = (new URLSearchParams(u.search)).get('title') || title || siteName;
    const theme = (new URLSearchParams(u.search)).get('theme') || 'light';
    const base = (import.meta?.env?.VITE_API_BASE_URL || '/api');
    return `${base}/og/image?title=${encodeURIComponent(titleParam)}&subtitle=${encodeURIComponent(description || '')}&theme=${encodeURIComponent(theme)}&image=${encodeURIComponent('https://dentalkit.com/Logo Lightmode.png')}`;
  })();
  const hrefLangs = (() => {
    if (alternates && Array.isArray(alternates)) return alternates;
    if (typeof window === 'undefined') return [];
    const u = new URL(canonicalUrl);
    const currentLang = u.searchParams.get('lang') || 'en';
    const otherLang = currentLang === 'ar' ? 'en' : 'ar';
    const make = (lang) => {
      const nu = new URL(u);
      nu.searchParams.set('lang', lang);
      return { lang, href: nu.toString() };
    };
    return [make(currentLang), make(otherLang)];
  })();

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description || ''} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="theme-color" content={themeColor} />
      <meta name="language" content={locale.startsWith('ar') ? 'ar' : 'en'} />
      {hrefLangs.map(({ lang, href }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description || ''} />
      <meta property="og:image" content={autoOg} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {hrefLangs
        .filter(({ lang }) => (locale.startsWith('ar') ? lang !== 'ar' : lang !== 'en'))
        .map(({ lang }) => (
          <meta key={`og:locale:${lang}`} property="og:locale:alternate" content={lang === 'ar' ? 'ar_SA' : 'en_US'} />
        ))}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description || ''} />
      <meta name="twitter:image" content={autoOg} />
    </Helmet>
  );
};

export default Seo;


