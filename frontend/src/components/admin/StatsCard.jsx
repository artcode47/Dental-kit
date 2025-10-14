import React from 'react';
import { useTranslation } from 'react-i18next';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color = 'blue',
  format = 'number',
  currency = 'USD'
}) => {
  const { t } = useTranslation('admin');

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    } else if (format === 'percentage') {
      return `${val}%`;
    } else if (format === 'number') {
      return new Intl.NumberFormat().format(val);
    }
    return val;
  };

  const getColorClasses = () => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        light: 'bg-blue-100',
        dark: 'dark:bg-blue-900',
        darkText: 'dark:text-blue-300'
      },
      green: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        light: 'bg-green-100',
        dark: 'dark:bg-green-900',
        darkText: 'dark:text-green-300'
      },
      red: {
        bg: 'bg-red-500',
        text: 'text-red-600',
        light: 'bg-red-100',
        dark: 'dark:bg-red-900',
        darkText: 'dark:text-red-300'
      },
      yellow: {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        light: 'bg-yellow-100',
        dark: 'dark:bg-yellow-900',
        darkText: 'dark:text-yellow-300'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-sky-600',
        light: 'bg-purple-100',
        dark: 'dark:bg-purple-900',
        darkText: 'dark:text-purple-300'
      },
      indigo: {
        bg: 'bg-indigo-500',
        text: 'text-blue-600',
        light: 'bg-indigo-100',
        dark: 'dark:bg-indigo-900',
        darkText: 'dark:text-indigo-300'
      }
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600 dark:text-green-400';
    if (changeType === 'negative') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗';
    if (changeType === 'negative') return '↘';
    return '→';
  };

  const colorClasses = getColorClasses();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200 h-full">
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
            {title}
          </p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${colorClasses.text} ${colorClasses.darkText} mb-2`}>
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center flex-wrap gap-1">
              <span className={`text-xs sm:text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()} {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('dashboard.fromLastMonth')}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-2 sm:p-3 rounded-lg ${colorClasses.light} ${colorClasses.dark} flex-shrink-0 ml-3`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClasses.text} ${colorClasses.darkText}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 