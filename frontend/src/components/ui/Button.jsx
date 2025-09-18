import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../../contexts/LanguageContext';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // Safely use language context with fallback
  let isRTL = false;
  try {
    const languageContext = useLanguage();
    isRTL = languageContext?.isRTL || false;
  } catch (error) {
    // Fallback if LanguageProvider is not available
    isRTL = false;
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 disabled:transform-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 focus:ring-blue-500 active:from-blue-800 active:to-purple-900 shadow-lg hover:shadow-xl transition-all duration-200',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:text-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:ring-gray-500 active:from-gray-300 dark:active:from-gray-500 shadow-md hover:shadow-lg transition-all duration-200',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 active:from-green-800 active:to-green-900 shadow-lg hover:shadow-xl transition-all duration-200',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 focus:ring-yellow-500 active:from-yellow-800 active:to-yellow-900 shadow-lg hover:shadow-xl transition-all duration-200',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 active:from-red-800 active:to-red-900 shadow-lg hover:shadow-xl transition-all duration-200',
    info: 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 focus:ring-blue-500 active:from-blue-800 active:to-purple-900 shadow-lg hover:shadow-xl transition-all duration-200',
    light: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:ring-gray-500 active:from-gray-300 dark:active:from-gray-500 shadow-md hover:shadow-lg transition-all duration-200',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-gray-950 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 focus:ring-gray-500 active:from-gray-950 dark:active:from-gray-800 shadow-lg hover:shadow-xl transition-all duration-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-100 dark:border-blue-400 dark:text-blue-400 dark:hover:from-blue-900/20 dark:hover:to-purple-800/20 focus:ring-blue-500 active:from-blue-100 dark:active:from-blue-900/40 shadow-md hover:shadow-lg transition-all duration-200',
    ghost: 'text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-100 dark:text-blue-400 dark:hover:from-blue-900/20 dark:hover:to-purple-800/20 focus:ring-blue-500 active:from-blue-100 dark:active:from-blue-900/40 transition-all duration-200',
    link: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:ring-blue-500 underline transition-colors duration-200'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  const iconClasses = clsx(
    iconSizes[size],
    'transition-transform duration-200',
    loading && 'animate-spin'
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }

    if (icon) {
      return React.cloneElement(icon, { className: iconClasses });
    }

    return null;
  };

  const renderContent = () => {
    const iconElement = renderIcon();
    
    if (!iconElement) {
      return children;
    }

    const iconWithMargin = (
      <span className={clsx(
        iconPosition === 'left' && !isRTL && 'mr-2',
        iconPosition === 'right' && !isRTL && 'ml-2',
        iconPosition === 'left' && isRTL && 'ml-2',
        iconPosition === 'right' && isRTL && 'mr-2'
      )}>
        {iconElement}
      </span>
    );

    if (iconPosition === 'left' || (iconPosition === 'left' && isRTL)) {
      return (
        <>
          {iconWithMargin}
          {children}
        </>
      );
    }

    return (
      <>
        {children}
        {iconWithMargin}
      </>
    );
  };

  return (
    <button
      ref={ref}
      type={type}
      className={twMerge(classes)}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 