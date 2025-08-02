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
  const { t } = useTranslation();

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
        text: 'text-purple-600',
        light: 'bg-purple-100',
        dark: 'dark:bg-purple-900',
        darkText: 'dark:text-purple-300'
      },
      indigo: {
        bg: 'bg-indigo-500',
        text: 'text-indigo-600',
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${colorClasses.text} ${colorClasses.darkText}`}>
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()} {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {t('admin.dashboard.fromLastMonth')}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses.light} ${colorClasses.dark}`}>
            <Icon className={`h-6 w-6 ${colorClasses.text} ${colorClasses.darkText}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 