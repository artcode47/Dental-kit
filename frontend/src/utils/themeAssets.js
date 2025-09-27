// Centralized theme-based asset selection

export function getLogoPath(isDark, { variant = 'default' } = {}) {
  // Variants: default (used on auth pages), page (MobileLogo legacy)
  if (variant === 'page') {
    return isDark ? '/Logo Page Darkmode.png' : '/Logo Page Lightmode.png';
  }
  return isDark ? '/Logo Darkmode.png' : '/Logo Lightmode.png';
}


