import React from 'react';
import { useTranslation } from 'react-i18next';

const PasswordStrengthIndicator = ({ strength, className = '' }) => {
  const { t } = useTranslation('auth');

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    if (score <= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score <= 4) return 'text-teal-600 bg-teal-100 dark:bg-teal-900/20';
    return 'text-green-600 bg-green-100 dark:bg-green-900/20';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return t('validation.password.veryWeak');
    if (score <= 3) return t('validation.password.weak');
    if (score <= 4) return t('validation.password.medium');
    return t('validation.password.strong');
  };

  const getProgressBarColor = (score) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-teal-500';
    return 'bg-green-500';
  };

  if (!strength || strength.score === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Label and Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('register.passwordStrength')}:
        </span>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${getPasswordStrengthColor(strength.score)}`}>
          {getPasswordStrengthText(strength.score)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarColor(strength.score)}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>

      {/* Feedback Messages */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((message, index) => (
            <div key={index} className="flex items-center text-xs text-red-600 dark:text-red-400">
              <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          ))}
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <svg className={`w-3 h-3 mr-2 ${strength.score >= 1 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {strength.score >= 1 ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            )}
          </svg>
          {t('validation.password.min')}
        </div>
        <div className="flex items-center">
          <svg className={`w-3 h-3 mr-2 ${strength.score >= 2 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {strength.score >= 2 ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            )}
          </svg>
          {t('validation.password.lowercase')}
        </div>
        <div className="flex items-center">
          <svg className={`w-3 h-3 mr-2 ${strength.score >= 3 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {strength.score >= 3 ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            )}
          </svg>
          {t('validation.password.uppercase')}
        </div>
        <div className="flex items-center">
          <svg className={`w-3 h-3 mr-2 ${strength.score >= 4 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {strength.score >= 4 ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            )}
          </svg>
          {t('validation.password.number')}
        </div>
        <div className="flex items-center col-span-2">
          <svg className={`w-3 h-3 mr-2 ${strength.score >= 5 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {strength.score >= 5 ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            )}
          </svg>
          {t('validation.password.symbol')}
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
