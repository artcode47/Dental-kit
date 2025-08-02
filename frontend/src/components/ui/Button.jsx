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

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 active:bg-teal-800 shadow-teal',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 active:bg-gray-300 dark:active:bg-gray-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 active:bg-success-800',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 active:bg-warning-800',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 active:bg-error-800',
    info: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 active:bg-teal-800',
    light: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 focus:ring-gray-500 active:bg-gray-300 dark:active:bg-gray-500',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500 active:bg-gray-950 dark:active:bg-gray-800',
    outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900/20 focus:ring-teal-500 active:bg-teal-100 dark:active:bg-teal-900/40',
    ghost: 'text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/20 focus:ring-teal-500 active:bg-teal-100 dark:active:bg-teal-900/40',
    link: 'text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 focus:ring-teal-500 underline'
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