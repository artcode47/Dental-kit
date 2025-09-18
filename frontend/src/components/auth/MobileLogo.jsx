import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

const MobileLogo = () => {
  const { t } = useTranslation('auth');
  const { isDark } = useTheme();

  // Get logo path based on theme
  const getLogoPath = useCallback(() => {
    if (isDark()) {
      return '/Logo Page Darkmode.png';
    }
    return '/Logo Page Lightmode.png';
  }, [isDark]);

  return (
    <div className="lg:hidden text-center mb-8">
      <div className="flex justify-center mb-6">
        <img
          src={getLogoPath()}
          alt={t('brand.name')}
          className="w-20 h-20 object-contain drop-shadow-md"
          loading="eager"
          style={{ aspectRatio: '1/1' }}
        />
      </div>
    </div>
  );
};

export default MobileLogo;
