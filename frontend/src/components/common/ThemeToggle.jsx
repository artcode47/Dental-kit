import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ 
  variant = 'toggle',
  size = 'md',
  className,
  showLabels = false,
  showSystem = true
}) => {
  const { currentTheme, toggleTheme, setTheme, useSystemTheme, isSystemTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200
          ${sizes[size]}
          ${className}
        `}
        aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <SunIcon 
          className={`
            ${iconSizes[size]} transition-all duration-300
            ${currentTheme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}
          `}
        />
        <MoonIcon 
          className={`
            ${iconSizes[size]} absolute transition-all duration-300
            ${currentTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}
          `}
        />
      </button>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <button
          onClick={() => setTheme('light')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
            ${currentTheme === 'light' && !isSystemTheme
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            ${buttonSizes[size]}
          `}
        >
          <SunIcon className={iconSizes[size]} />
          {showLabels && <span>Light</span>}
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
            ${currentTheme === 'dark' && !isSystemTheme
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            ${buttonSizes[size]}
          `}
        >
          <MoonIcon className={iconSizes[size]} />
          {showLabels && <span>Dark</span>}
        </button>

        {showSystem && (
          <button
            onClick={useSystemTheme}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
                          ${isSystemTheme
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
              ${buttonSizes[size]}
            `}
          >
            <ComputerDesktopIcon className={iconSizes[size]} />
            {showLabels && <span>System</span>}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
          ${buttonSizes[size]}
        `}
      >
        <div className="flex items-center space-x-2">
          {currentTheme === 'light' && <SunIcon className={iconSizes[size]} />}
          {currentTheme === 'dark' && <MoonIcon className={iconSizes[size]} />}
          {isSystemTheme && <ComputerDesktopIcon className={iconSizes[size]} />}
          {showLabels && (
            <span className="font-medium">
              {isSystemTheme ? 'System' : currentTheme === 'light' ? 'Light' : 'Dark'}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`
                flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200
                ${currentTheme === 'light' && !isSystemTheme ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                ${buttonSizes[size]}
              `}
            >
              <SunIcon className={`${iconSizes[size]} mr-3`} />
              <span>Light</span>
            </button>

            <button
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`
                flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200
                ${currentTheme === 'dark' && !isSystemTheme ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                ${buttonSizes[size]}
              `}
            >
              <MoonIcon className={`${iconSizes[size]} mr-3`} />
              <span>Dark</span>
            </button>

            {showSystem && (
              <button
                onClick={() => {
                  useSystemTheme();
                  setIsOpen(false);
                }}
                className={`
                  flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200
                  ${isSystemTheme ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  ${buttonSizes[size]}
                `}
              >
                <ComputerDesktopIcon className={`${iconSizes[size]} mr-3`} />
                <span>System</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 