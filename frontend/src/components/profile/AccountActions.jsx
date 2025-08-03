import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';
import { CogIcon, TrashIcon, ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AccountActions = ({ onLogout, onDeleteAccount }) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDeleteAccount();
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('profile.accountActions')}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t('profile.manageAccount')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center text-sm sm:text-base font-medium"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t('profile.logout')}
          </Button>
          
          <Button
            onClick={handleDeleteClick}
            variant="outline"
            className="border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center text-sm sm:text-base font-medium"
          >
            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t('profile.deleteAccount')}
          </Button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200 mb-2">
                {t('profile.deleteAccount')}
              </h4>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mb-4">
                {t('profile.deleteAccountConfirm')}
              </p>
              
              {/* Confirmation Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={handleDeleteConfirm}
                  variant="outline"
                  className="border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium"
                >
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('profile.deleteAccount')}
                </Button>
                
                <Button
                  onClick={handleDeleteCancel}
                  variant="outline"
                  className="border-2 border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium"
                >
                  <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('profile.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountActions;