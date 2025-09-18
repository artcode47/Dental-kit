import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const Pagination = ({ currentPage, totalPages, total, perPage, onPage, t }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
        {t('orders.showing')} <span className="font-medium">{startItem}</span> {t('orders.to')} <span className="font-medium">{endItem}</span> {t('orders.of')} <span className="font-medium">{total}</span> {t('orders.results')}
      </div>
      
      <div className="flex items-center justify-center sm:justify-end gap-2">
        {/* Previous Button */}
        <button 
          onClick={() => onPage(currentPage - 1)} 
          disabled={currentPage === 1} 
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('orders.previous')}</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </span>
              ) : (
                <button 
                  onClick={() => onPage(page)} 
                  className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                    currentPage === page 
                      ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300' 
                      : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button 
          onClick={() => onPage(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        >
          <span className="hidden sm:inline">{t('orders.next')}</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
