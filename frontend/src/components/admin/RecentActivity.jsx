import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon, 
  ShoppingCartIcon, 
  StarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ activities = [] }) => {
  const { t } = useTranslation('admin');

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return UserIcon;
      case 'order':
        return ShoppingCartIcon;
      case 'review':
        return StarIcon;
      case 'alert':
        return ExclamationTriangleIcon;
      case 'success':
        return CheckCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'order':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'review':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'alert':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return t('dashboard.justNow');
    } else if (diffInMinutes < 60) {
      return t('dashboard.minutesAgo', { minutes: diffInMinutes });
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return t('dashboard.hoursAgo', { hours });
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return t('dashboard.daysAgo', { days });
    }
  };

  if (activities.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.noRecentActivity')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('dashboard.recentActivity')}
      </h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);
          
          return (
            <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
              
              {activity.status && (
                <span className={`
                  flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                  ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                  ${activity.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                `}>
                  {t(`dashboard.status.${activity.status}`)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200">
          {t('dashboard.viewAllActivity')}
        </button>
      </div>
    </div>
  );
};

export default RecentActivity; 