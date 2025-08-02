import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import Button from './Button';

const TestComponent = () => {
  const { currentTheme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Theme System Test
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Theme Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Current Theme: {currentTheme}
              </h2>
              
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  Is Dark: {isDark() ? 'Yes' : 'No'}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Is Light: {isLight() ? 'Yes' : 'No'}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <ThemeToggle variant="toggle" size="lg" />
                <Button onClick={toggleTheme} variant="primary">
                  Toggle Theme
                </Button>
              </div>
            </div>
            
            {/* Color Showcase */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Brand Colors
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-teal-500 text-white p-4 rounded-lg text-center">
                  Teal 500
                </div>
                <div className="bg-teal-600 text-white p-4 rounded-lg text-center">
                  Teal 600
                </div>
                <div className="bg-teal-400 text-white p-4 rounded-lg text-center">
                  Teal 400
                </div>
                <div className="bg-teal-700 text-white p-4 rounded-lg text-center">
                  Teal 700
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200 p-3 rounded-lg">
                  Teal Background
                </div>
                <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700 text-success-800 dark:text-success-200 p-3 rounded-lg">
                  Success Background
                </div>
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 text-warning-800 dark:text-warning-200 p-3 rounded-lg">
                  Warning Background
                </div>
                <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 text-error-800 dark:text-error-200 p-3 rounded-lg">
                  Error Background
                </div>
              </div>
            </div>
          </div>
          
          {/* Button Showcase */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Button Variants
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          
          {/* Text Colors */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Text Colors
            </h2>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-gray-100">Primary Text</p>
              <p className="text-gray-600 dark:text-gray-300">Secondary Text</p>
              <p className="text-gray-500 dark:text-gray-400">Tertiary Text</p>
              <p className="text-teal-600 dark:text-teal-400">Teal Text</p>
              <p className="text-success-600 dark:text-success-400">Success Text</p>
              <p className="text-warning-600 dark:text-warning-400">Warning Text</p>
              <p className="text-error-600 dark:text-error-400">Error Text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent; 