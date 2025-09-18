import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ProductBreadcrumb = ({ productName }) => {
  const { t } = useTranslation('ecommerce');
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button 
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {t('nav.home')}
              </button>
            </li>
            <li>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </li>
            <li>
              <button 
                onClick={() => navigate('/products')}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {t('products.title')}
              </button>
            </li>
            <li>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </li>
            <li className="text-gray-900 dark:text-white font-semibold truncate max-w-xs">
              {productName}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default ProductBreadcrumb; 