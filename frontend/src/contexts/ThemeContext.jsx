import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getParam, syncParam } from '../utils/urlBuilder';

const ThemeContext = createContext();

const themes = {
  light: {
    name: 'light',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      surface: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        elevated: '#ffffff',
        card: '#ffffff'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        inverse: '#ffffff',
        muted: '#94a3b8'
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        tertiary: '#f1f5f9'
      },
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: {
        50: '#172554',
        100: '#1e3a8a',
        200: '#1e40af',
        300: '#1d4ed8',
        400: '#2563eb',
        500: '#3b82f6',
        600: '#60a5fa',
        700: '#93c5fd',
        800: '#bfdbfe',
        900: '#dbeafe',
        950: '#eff6ff'
      },
      secondary: {
        50: '#020617',
        100: '#0f172a',
        200: '#1e293b',
        300: '#334155',
        400: '#475569',
        500: '#64748b',
        600: '#94a3b8',
        700: '#cbd5e1',
        800: '#e2e8f0',
        900: '#f1f5f9',
        950: '#f8fafc'
      },
      success: {
        50: '#052e16',
        100: '#14532d',
        200: '#166534',
        300: '#15803d',
        400: '#16a34a',
        500: '#22c55e',
        600: '#4ade80',
        700: '#86efac',
        800: '#bbf7d0',
        900: '#dcfce7',
        950: '#f0fdf4'
      },
      warning: {
        50: '#451a03',
        100: '#78350f',
        200: '#92400e',
        300: '#b45309',
        400: '#d97706',
        500: '#f59e0b',
        600: '#fbbf24',
        700: '#fcd34d',
        800: '#fde68a',
        900: '#fef3c7',
        950: '#fffbeb'
      },
      error: {
        50: '#450a0a',
        100: '#7f1d1d',
        200: '#991b1b',
        300: '#b91c1c',
        400: '#dc2626',
        500: '#ef4444',
        600: '#f87171',
        700: '#fca5a5',
        800: '#fecaca',
        900: '#fee2e2',
        950: '#fef2f2'
      },
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        overlay: 'rgba(0, 0, 0, 0.7)'
      },
      surface: {
        primary: '#1e293b',
        secondary: '#334155',
        tertiary: '#475569',
        elevated: '#334155',
        card: '#1e293b'
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#0f172a',
        muted: '#64748b'
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
        tertiary: '#1e293b'
      },
      shadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
      }
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [systemTheme, setSystemTheme] = useState('light');
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // Initialize theme (from URL > cookie > system)
  useEffect(() => {
    const urlTheme = getParam('theme');
    const savedTheme = Cookies.get('theme');
    const savedSystemPreference = Cookies.get('systemTheme');
    
    // Detect system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const detectedSystemTheme = mediaQuery.matches ? 'dark' : 'light';
    setSystemTheme(detectedSystemTheme);
    
    // Listen for system theme changes
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      if (isSystemTheme) {
        setCurrentTheme(newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Set initial theme
    if (urlTheme) {
      setIsSystemTheme(false);
      setCurrentTheme(urlTheme);
      applyTheme(urlTheme);
    } else if (savedSystemPreference === 'true') {
      setIsSystemTheme(true);
      setCurrentTheme(detectedSystemTheme);
      applyTheme(detectedSystemTheme);
    } else if (savedTheme) {
      setIsSystemTheme(false);
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to system theme
      setIsSystemTheme(true);
      setCurrentTheme(detectedSystemTheme);
      applyTheme(detectedSystemTheme);
    }
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(theme);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = themes[theme].colors;
      metaThemeColor.setAttribute('content', themeColors.background.primary);
    }
  };

  const setTheme = (theme) => {
    if (!themes[theme]) {
      console.error(`Theme "${theme}" not found`);
      return;
    }
    
    setCurrentTheme(theme);
    setIsSystemTheme(false);
    applyTheme(theme);
    // Avoid URL param mutations that can trigger reloads on mobile
    // syncParam('theme', theme);
    
    // Save preferences
    Cookies.set('theme', theme, { expires: 365 });
    Cookies.set('systemTheme', 'false', { expires: 365 });
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const useSystemTheme = () => {
    setIsSystemTheme(true);
    setCurrentTheme(systemTheme);
    applyTheme(systemTheme);
    // Avoid URL param mutations that can trigger reloads on mobile
    // syncParam('theme', systemTheme);
    
    // Save preferences
    Cookies.remove('theme');
    Cookies.set('systemTheme', 'true', { expires: 365 });
  };

  const getThemeColors = () => {
    return themes[currentTheme].colors;
  };

  const getThemeColor = (category, shade = '500') => {
    return themes[currentTheme].colors[category]?.[shade];
  };

  const isDark = () => {
    return currentTheme === 'dark';
  };

  const isLight = () => {
    return currentTheme === 'light';
  };

  const value = {
    currentTheme,
    systemTheme,
    isSystemTheme,
    themes,
    setTheme,
    toggleTheme,
    useSystemTheme,
    getThemeColors,
    getThemeColor,
    isDark,
    isLight
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 