import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Color palette data
const colorPalette = {
  teal: {
    name: 'Teal (Primary Brand)',
    description: 'Main brand color used for primary actions and key UI elements',
    colors: [
      { name: 'teal-50', hex: '#f0fdfa', usage: 'Very light backgrounds, subtle accents' },
      { name: 'teal-100', hex: '#ccfbf1', usage: 'Light backgrounds, hover states' },
      { name: 'teal-200', hex: '#99f6e4', usage: 'Border colors, secondary backgrounds' },
      { name: 'teal-300', hex: '#5eead4', usage: 'Light accents, disabled states' },
      { name: 'teal-400', hex: '#2dd4bf', usage: 'Secondary actions, lighter text' },
      { name: 'teal-500', hex: '#00b1db', usage: 'Main brand color - primary actions' },
      { name: 'teal-600', hex: '#0891b2', usage: 'Hover states, active elements' },
      { name: 'teal-700', hex: '#0e7490', usage: 'Pressed states, darker accents' },
      { name: 'teal-800', hex: '#155e75', usage: 'Dark backgrounds, borders' },
      { name: 'teal-900', hex: '#164e63', usage: 'Very dark backgrounds' },
      { name: 'teal-950', hex: '#042f2e', usage: 'Darkest backgrounds' }
    ]
  },
  semantic: {
    success: {
      name: 'Success (Green)',
      description: 'Used for success messages, completed actions, positive feedback',
      colors: [
        { name: 'success-50', hex: '#f0fdf4', usage: 'Success backgrounds' },
        { name: 'success-500', hex: '#22c55e', usage: 'Success text and icons' },
        { name: 'success-900', hex: '#14532d', usage: 'Dark success elements' }
      ]
    },
    warning: {
      name: 'Warning (Yellow/Orange)',
      description: 'Used for warnings, caution messages, pending states',
      colors: [
        { name: 'warning-50', hex: '#fffbeb', usage: 'Warning backgrounds' },
        { name: 'warning-500', hex: '#f59e0b', usage: 'Warning text and icons' },
        { name: 'warning-900', hex: '#78350f', usage: 'Dark warning elements' }
      ]
    },
    error: {
      name: 'Error (Red)',
      description: 'Used for error messages, destructive actions, validation errors',
      colors: [
        { name: 'error-50', hex: '#fef2f2', usage: 'Error backgrounds' },
        { name: 'error-500', hex: '#ef4444', usage: 'Error text and icons' },
        { name: 'error-900', hex: '#7f1d1d', usage: 'Dark error elements' }
      ]
    }
  },
  neutral: {
    name: 'Neutral (Gray)',
    description: 'Used for text, backgrounds, borders, and other UI elements',
    colors: [
      { name: 'gray-50', hex: '#f8fafc', usage: 'Page backgrounds' },
      { name: 'gray-100', hex: '#f1f5f9', usage: 'Card backgrounds' },
      { name: 'gray-200', hex: '#e2e8f0', usage: 'Borders, dividers' },
      { name: 'gray-300', hex: '#cbd5e1', usage: 'Input borders' },
      { name: 'gray-400', hex: '#94a3b8', usage: 'Placeholder text' },
      { name: 'gray-500', hex: '#64748b', usage: 'Secondary text' },
      { name: 'gray-600', hex: '#475569', usage: 'Body text' },
      { name: 'gray-700', hex: '#334155', usage: 'Headings' },
      { name: 'gray-800', hex: '#1e293b', usage: 'Dark backgrounds' },
      { name: 'gray-900', hex: '#0f172a', usage: 'Very dark backgrounds' }
    ]
  }
};

// Utility functions for color usage
export const useThemeColors = () => {
  const { currentTheme } = useTheme();
  
  const colors = {
    // Brand colors
    primary: {
      50: 'bg-teal-50 text-teal-900',
      100: 'bg-teal-100 text-teal-900',
      200: 'bg-teal-200 text-teal-900',
      300: 'bg-teal-300 text-teal-900',
      400: 'bg-teal-400 text-teal-900',
      500: 'bg-teal-500 text-white',
      600: 'bg-teal-600 text-white',
      700: 'bg-teal-700 text-white',
      800: 'bg-teal-800 text-white',
      900: 'bg-teal-900 text-white',
      950: 'bg-teal-950 text-white'
    },
    
    // Semantic colors
    success: {
      50: 'bg-success-50 text-success-900',
      500: 'bg-success-500 text-white',
      900: 'bg-success-900 text-white'
    },
    warning: {
      50: 'bg-warning-50 text-warning-900',
      500: 'bg-warning-500 text-white',
      900: 'bg-warning-900 text-white'
    },
    error: {
      50: 'bg-error-50 text-error-900',
      500: 'bg-error-500 text-white',
      900: 'bg-error-900 text-white'
    },
    
    // Neutral colors
    neutral: {
      50: 'bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100',
      100: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
      200: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
      300: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-100',
      400: 'bg-gray-400 text-white dark:bg-gray-500 dark:text-white',
      500: 'bg-gray-500 text-white dark:bg-gray-400 dark:text-white',
      600: 'bg-gray-600 text-white dark:bg-gray-300 dark:text-gray-900',
      700: 'bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900',
      800: 'bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900',
      900: 'bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900'
    }
  };
  
  const classes = {
  text: {
      primary: 'text-gray-900 dark:text-gray-100',
      secondary: 'text-gray-600 dark:text-gray-300',
      tertiary: 'text-gray-500 dark:text-gray-400',
      muted: 'text-gray-400 dark:text-gray-500',
      inverse: 'text-white dark:text-gray-900'
    },
    background: {
      primary: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      tertiary: 'bg-gray-100 dark:bg-gray-700'
    },
    border: {
      primary: 'border-gray-200 dark:border-gray-700',
      secondary: 'border-gray-300 dark:border-gray-600',
      accent: 'border-teal-200 dark:border-teal-700'
    }
  };
  
  const components = {
  button: {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-teal',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-500',
      outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-400 dark:hover:text-gray-900',
      ghost: 'text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20'
    },
    card: {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
      elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md',
      primary: 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700'
    },
  input: {
      default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent',
      error: 'border border-error-300 dark:border-error-600 focus:ring-error-500',
      success: 'border border-success-300 dark:border-success-600 focus:ring-success-500'
    },
    alert: {
      info: 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200',
      success: 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 text-success-800 dark:text-success-200',
      warning: 'bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 text-warning-800 dark:text-warning-200',
      error: 'bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 text-error-800 dark:text-error-200'
    }
  };
  
  return { colors, classes, components, currentTheme };
};

// Color palette showcase component
export const ColorPalette = ({ showUsage = true, showSemantic = true, showNeutral = true }) => {
  const { currentTheme } = useTheme();
  
  const ColorSwatch = ({ color, showUsage: showUsageProp }) => (
    <div className="group relative">
      <div 
        className={`w-full h-16 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105 cursor-pointer`}
        style={{ backgroundColor: color.hex }}
        title={`${color.name}: ${color.hex}`}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-xs font-mono bg-black/20 text-white px-2 py-1 rounded">
            {color.hex}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {color.name}
        </div>
        {showUsageProp && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {color.usage}
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-8">
      {/* Brand Colors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {colorPalette.teal.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {colorPalette.teal.description}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {colorPalette.teal.colors.map((color) => (
            <ColorSwatch key={color.name} color={color} showUsage={showUsage} />
          ))}
        </div>
      </div>
      
      {/* Semantic Colors */}
      {showSemantic && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Semantic Colors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(colorPalette.semantic).map(([key, semantic]) => (
              <div key={key}>
                <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {semantic.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {semantic.description}
                </p>
                <div className="space-y-3">
                  {semantic.colors.map((color) => (
                    <ColorSwatch key={color.name} color={color} showUsage={showUsage} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Neutral Colors */}
      {showNeutral && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {colorPalette.neutral.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {colorPalette.neutral.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {colorPalette.neutral.colors.map((color) => (
              <ColorSwatch key={color.name} color={color} showUsage={showUsage} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main ColorSystem component
const ColorSystem = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            DentalKit Color System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A comprehensive color palette built around our primary teal color (#00b1db) 
            designed for consistency, accessibility, and brand recognition across all platforms.
          </p>
          <div className="mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200">
              Current Theme: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Color Palette */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <ColorPalette />
        </div>
        
        {/* Usage Examples */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Usage Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Buttons
            </h3>
              <div className="space-y-3">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                Primary Button
              </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                Secondary Button
              </button>
                <button className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-400 dark:hover:text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
                Outline Button
              </button>
            </div>
          </div>
          
          {/* Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Alerts
            </h3>
              <div className="space-y-3">
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200 px-4 py-3 rounded-lg">
                  Information message
                </div>
                <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 text-success-800 dark:text-success-200 px-4 py-3 rounded-lg">
                  Success message
              </div>
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 text-warning-800 dark:text-warning-200 px-4 py-3 rounded-lg">
                  Warning message
              </div>
                <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 text-error-800 dark:text-error-200 px-4 py-3 rounded-lg">
                  Error message
              </div>
              </div>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default ColorSystem; 