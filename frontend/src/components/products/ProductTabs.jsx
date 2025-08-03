import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const ProductTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'description', label: t('products.details.tabs.description') },
    { id: 'specifications', label: t('products.details.tabs.specifications') },
    { id: 'reviews', label: t('products.details.tabs.reviews') },
    { id: 'related', label: t('products.details.tabs.related') }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 sm:py-6 px-1 border-b-2 font-medium text-base sm:text-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProductTabs; 