// Lightweight helpers to standardize SEO metadata across auth pages

export function buildAuthSeo({ tSeo, kind, isDark, currentLanguage }) {
  const defaults = {
    login: {
      title: tSeo?.('seo.login.title', 'Login - DentalKit'),
      description: tSeo?.(
        'seo.login.description',
        'Sign in to your DentalKit account to access professional dental equipment and supplies'
      )
    },
    register: {
      title: tSeo?.('seo.register.title', 'Register - DentalKit'),
      description: tSeo?.(
        'seo.register.description',
        'Create your DentalKit account to access professional dental equipment and supplies'
      )
    },
    resetPassword: {
      title: tSeo?.('seo.resetPassword.title', 'Reset Password - DentalKit'),
      description: tSeo?.('seo.resetPassword.description', 'Create a new password for your DentalKit account')
    },
    verifyEmail: {
      title: tSeo?.('seo.verifyEmail.title', 'Verifying Email - DentalKit'),
      description: tSeo?.('seo.verifyEmail.description', 'Verifying your email address for DentalKit account')
    }
  };

  const { title, description } = defaults[kind] || {};

  return {
    title,
    description,
    type: 'website',
    locale: currentLanguage === 'ar' ? 'ar_SA' : 'en_US',
    themeColor: isDark ? '#0B1220' : '#FFFFFF'
  };
}


