import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../../contexts/LanguageContext';

const Input = React.forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  warning,
  disabled = false,
  required = false,
  readOnly = false,
  fullWidth = false,
  size = 'md',
  leftIcon,
  rightIcon,
  leftAddon,
  rightAddon,
  className,
  containerClassName,
  labelClassName,
  errorClassName,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = 'block w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed read-only:bg-gray-50';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getStateClasses = () => {
    if (error) {
      return 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-400 dark:placeholder-red-400 focus:border-red-500 focus:ring-red-500 bg-white dark:bg-gray-700';
    }
    if (success) {
      return 'border-green-300 dark:border-green-600 text-green-900 dark:text-green-100 placeholder-green-400 dark:placeholder-green-400 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-700';
    }
    if (warning) {
      return 'border-yellow-300 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100 placeholder-yellow-400 dark:placeholder-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 bg-white dark:bg-gray-700';
    }
    return 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-gray-700';
  };

  const getIconColor = () => {
    if (error) return 'text-red-500 dark:text-red-400';
    if (success) return 'text-green-500 dark:text-green-400';
    if (warning) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-gray-400 dark:text-gray-500';
  };

  const inputClasses = clsx(
    baseClasses,
    sizes[size],
    getStateClasses(),
    leftIcon && (isRTL ? 'pr-10' : 'pl-10'),
    rightIcon && (isRTL ? 'pl-10' : 'pr-10'),
    leftAddon && (isRTL ? 'rounded-r-lg rounded-l-none' : 'rounded-l-lg rounded-r-none'),
    rightAddon && (isRTL ? 'rounded-l-lg rounded-r-none' : 'rounded-r-lg rounded-l-none'),
    className
  );

  const containerClasses = clsx(
    'relative',
    fullWidth && 'w-full',
    containerClassName
  );

  const labelClasses = clsx(
    'block text-sm font-medium mb-1',
    error ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300',
    labelClassName
  );

  const errorClasses = clsx(
    'mt-1 text-sm',
    'text-red-600 dark:text-red-400',
    errorClassName
  );

  const iconClasses = clsx(
    iconSizes[size],
    getIconColor(),
    'absolute top-1/2 transform -translate-y-1/2'
  );

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const renderIcon = (icon, position) => {
    if (!icon) return null;

    const positionClasses = position === 'left' 
      ? (isRTL ? 'right-3' : 'left-3')
      : (isRTL ? 'left-3' : 'right-3');

    return (
      <div className={clsx(iconClasses, positionClasses)}>
        {React.cloneElement(icon, { className: iconSizes[size] })}
      </div>
    );
  };

  const renderAddon = (addon, position) => {
    if (!addon) return null;

    const addonClasses = clsx(
      'inline-flex items-center px-3 border border-gray-300 bg-gray-50 text-gray-500 text-sm',
      sizes[size],
      position === 'left' 
        ? (isRTL ? 'rounded-l-lg border-r-0' : 'rounded-l-lg border-r-0')
        : (isRTL ? 'rounded-r-lg border-l-0' : 'rounded-r-lg border-l-0')
    );

    return (
      <span className={addonClasses}>
        {addon}
      </span>
    );
  };

  const renderInput = () => {
    const inputElement = (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={inputClasses}
        {...props}
      />
    );

    // If we have addons, wrap in a flex container
    if (leftAddon || rightAddon) {
      return (
        <div className="flex">
          {isRTL ? (
            <>
              {renderAddon(rightAddon, 'right')}
              {inputElement}
              {renderAddon(leftAddon, 'left')}
            </>
          ) : (
            <>
              {renderAddon(leftAddon, 'left')}
              {inputElement}
              {renderAddon(rightAddon, 'right')}
            </>
          )}
        </div>
      );
    }

    return inputElement;
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {renderInput()}
        {renderIcon(leftIcon, 'left')}
        {renderIcon(rightIcon, 'right')}
      </div>
      
      {error && (
        <p className={errorClasses}>
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="mt-1 text-sm text-green-600">
          {success}
        </p>
      )}
      
      {warning && !error && !success && (
        <p className="mt-1 text-sm text-yellow-600">
          {warning}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 