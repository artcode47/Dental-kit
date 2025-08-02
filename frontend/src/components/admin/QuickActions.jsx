import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  UserPlusIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      title: t('admin.quickActions.addUser'),
      description: t('admin.quickActions.addUserDesc'),
      icon: UserPlusIcon,
      href: '/admin/users/new',
      color: 'blue'
    },
    {
      title: t('admin.quickActions.addProduct'),
      description: t('admin.quickActions.addProductDesc'),
      icon: CubeIcon,
      href: '/admin/products/new',
      color: 'green'
    },
    {
      title: t('admin.quickActions.addCategory'),
      description: t('admin.quickActions.addCategoryDesc'),
      icon: TagIcon,
      href: '/admin/categories/new',
      color: 'purple'
    },
    {
      title: t('admin.quickActions.generateReport'),
      description: t('admin.quickActions.generateReportDesc'),
      icon: DocumentTextIcon,
      href: '/admin/reports',
      color: 'yellow'
    },
    {
      title: t('admin.quickActions.systemSettings'),
      description: t('admin.quickActions.systemSettingsDesc'),
      icon: CogIcon,
      href: '/admin/settings',
      color: 'gray'
    },
    {
      title: t('admin.quickActions.viewAnalytics'),
      description: t('admin.quickActions.viewAnalyticsDesc'),
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-300',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-800'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900',
        text: 'text-green-600 dark:text-green-300',
        hover: 'hover:bg-green-200 dark:hover:bg-green-800'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900',
        text: 'text-purple-600 dark:text-purple-300',
        hover: 'hover:bg-purple-200 dark:hover:bg-purple-800'
      },
      yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900',
        text: 'text-yellow-600 dark:text-yellow-300',
        hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-800'
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-300',
        hover: 'hover:bg-gray-200 dark:hover:bg-gray-600'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900',
        text: 'text-indigo-600 dark:text-indigo-300',
        hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800'
      }
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('admin.quickActions.title')}
        </h3>
        <BellIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colorClasses = getColorClasses(action.color);
          
          return (
            <Link
              key={index}
              to={action.href}
              className={`
                group p-4 rounded-lg border border-gray-200 dark:border-gray-700 
                hover:border-gray-300 dark:hover:border-gray-600 
                transition-all duration-200 hover:shadow-md
                ${colorClasses.hover}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                  <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('admin.quickActions.needHelp')}
          </p>
          <Link 
            to="/admin/help"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            {t('admin.quickActions.getHelp')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 