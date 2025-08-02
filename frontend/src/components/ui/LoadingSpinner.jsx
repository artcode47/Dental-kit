import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  className,
  text,
  fullScreen = false,
  overlay = false
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const variants = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    light: 'text-gray-300',
    dark: 'text-gray-800',
    white: 'text-white'
  };

  const spinnerClasses = clsx(
    'animate-spin',
    sizes[size],
    variants[variant],
    className
  );

  const containerClasses = clsx(
    'flex flex-col items-center justify-center',
    fullScreen && 'fixed inset-0 z-50 bg-white bg-opacity-90',
    overlay && 'absolute inset-0 z-40 bg-white bg-opacity-75'
  );

  const spinner = (
    <svg className={spinnerClasses} fill="none" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (fullScreen || overlay) {
    return (
      <div className={containerClasses}>
        {spinner}
        {text && (
          <p className="mt-2 text-sm text-gray-600">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center">
        {spinner}
        <p className="mt-2 text-sm text-gray-600">
          {text}
        </p>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 