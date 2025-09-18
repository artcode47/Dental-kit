import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showPageInfo = true,
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  className = ''
}) => {
  const { t } = useTranslation('common');

  // Calculate page range to display
  const getPageRange = () => {
    const delta = 2; // Number of pages to show on each side of current page
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
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  // Calculate item range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  const pageRange = getPageRange();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {/* Page Info */}
      {showPageInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">
            {t('pagination.showing', { start: startItem, end: endItem, total: totalItems })}
          </span>
        </div>
      )}

      {/* Page Size Selector */}
      {showPageSize && onPageSizeChange && (
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-sm text-gray-700 dark:text-gray-300">
            {t('pagination.itemsPerPage')}:
          </label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={handlePageSizeChange}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        <Button
          onClick={() => handlePageChange(1)}
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          className="px-2 py-1 min-w-[32px] h-8"
          title={t('pagination.firstPage')}
        >
          <ChevronDoubleLeftIcon className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          className="px-2 py-1 min-w-[32px] h-8"
          title={t('pagination.previousPage')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        {pageRange.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <Button
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? 'primary' : 'outline'}
                size="sm"
                className={`px-3 py-1 min-w-[32px] h-8 ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next Page */}
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          className="px-2 py-1 min-w-[32px] h-8"
          title={t('pagination.nextPage')}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          onClick={() => handlePageChange(totalPages)}
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          className="px-2 py-1 min-w-[32px] h-8"
          title={t('pagination.lastPage')}
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Page Info */}
      <div className="sm:hidden text-sm text-gray-500 dark:text-gray-400">
        {t('pagination.page', { current: currentPage, total: totalPages })}
      </div>
    </div>
  );
};

export default Pagination;
