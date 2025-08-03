import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { UserCircleIcon, CameraIcon, CogIcon, KeyIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProfileHeader = ({ user, isEditing, onEditToggle, onImageUpload, isUploadingImage, getFullName, getUserRole }) => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center">
      {/* Profile Image Section */}
      <div className="relative inline-block mb-4 sm:mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-full flex items-center justify-center shadow-lg">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={t('profile.title')}
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-teal-600 dark:text-teal-400" />
          )}
        </div>
        
        {/* Camera Upload Button */}
        <label className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          {isUploadingImage ? (
            <LoadingSpinner size="xs" />
          ) : (
            <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            disabled={isUploadingImage}
          />
        </label>
      </div>

      {/* User Info */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
        {getFullName()}
      </h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
        {getUserRole()}
      </p>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t('profile.email')}
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
            {user?.email}
          </p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t('profile.country')}
          </p>
          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {user?.country || 'N/A'}
          </p>
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex justify-center">
        <button
          onClick={onEditToggle}
          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30 rounded-lg sm:rounded-xl transition-all duration-200 border border-teal-200 dark:border-teal-800"
        >
          {isEditing ? (
            <>
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('profile.cancel')}
            </>
          ) : (
            <>
              <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('profile.edit')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;