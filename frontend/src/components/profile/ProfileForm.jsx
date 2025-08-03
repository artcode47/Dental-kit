import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const ProfileForm = ({ formData, onInputChange, onSubmit, isEditing, isSaving, onCancel, countries, governorates, timezones, languages }) => {
  const { t } = useTranslation();
  
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      {/* Required Fields Notice */}
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
        <span className="text-red-600 dark:text-red-400 font-medium">*</span> {t('profile.requiredFields')}
      </div>

      {/* Personal Information Section */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          {t('profile.profileInformation')}
        </h3>
        
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input 
            label={`${t('profile.firstName')} *`} 
            name="firstName" 
            value={formData.firstName} 
            onChange={onInputChange} 
            disabled={!isEditing} 
            leftIcon={<UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />} 
            required 
          />
          <Input 
            label={`${t('profile.lastName')} *`} 
            name="lastName" 
            value={formData.lastName} 
            onChange={onInputChange} 
            disabled={!isEditing} 
            leftIcon={<UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />} 
            required 
          />
        </div>

        {/* Email Field */}
        <Input 
          label={`${t('profile.email')} *`} 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={onInputChange} 
          disabled 
          leftIcon={<EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />} 
          required 
        />

        {/* Contact Information */}
        <Input 
          label={t('profile.phone')} 
          name="phone" 
          value={formData.phone} 
          onChange={onInputChange} 
          disabled={!isEditing} 
          leftIcon={<PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />} 
        />

        {/* Professional Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input 
            label={t('profile.company')} 
            name="company" 
            value={formData.company} 
            onChange={onInputChange} 
            disabled={!isEditing} 
            leftIcon={<BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />} 
          />
          <Input 
            label={t('profile.university')} 
            name="university" 
            value={formData.university} 
            onChange={onInputChange} 
            disabled={!isEditing} 
            leftIcon={<AcademicCapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />} 
          />
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.country')}
            </label>
            <select 
              name="country" 
              value={formData.country} 
              onChange={onInputChange} 
              disabled={!isEditing} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 text-sm sm:text-base"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.governorate')}
            </label>
            <select 
              name="governorate" 
              value={formData.governorate} 
              onChange={onInputChange} 
              disabled={!isEditing} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 text-sm sm:text-base"
            >
              <option value="">{t('profile.selectGovernorate')}</option>
              {governorates[formData.country]?.map(governorate => (
                <option key={governorate} value={governorate}>{governorate}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.timezone')}
            </label>
            <select 
              name="timezone" 
              value={formData.timezone} 
              onChange={onInputChange} 
              disabled={!isEditing} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 text-sm sm:text-base"
            >
              {timezones.map(timezone => (
                <option key={timezone.value} value={timezone.value}>{timezone.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.language')}
            </label>
            <select 
              name="language" 
              value={formData.language} 
              onChange={onInputChange} 
              disabled={!isEditing} 
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-600 text-sm sm:text-base"
            >
              {languages.map(language => (
                <option key={language.code} value={language.code}>{language.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
          <Button 
            type="submit" 
            variant="primary" 
            loading={isSaving} 
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            {isSaving ? t('profile.saving') : t('profile.saveChanges')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
          >
            {t('profile.cancel')}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ProfileForm;