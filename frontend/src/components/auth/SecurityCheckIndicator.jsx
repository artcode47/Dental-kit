import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const SecurityCheckIndicator = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
        {t('auth.common.securityCheckPassed')}
      </span>
    </div>
  );
};

export default SecurityCheckIndicator;
