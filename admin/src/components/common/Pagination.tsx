import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ''
}: PaginationProps) {
  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPaginationRange = () => {
    const delta = 2; // Number of pages to show on each side of current
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (typeof i === 'number' && i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === 'number' && i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      if (typeof i === 'number') {
        l = i;
      }
    });

    return rangeWithDots;
  };

  // Don't render if only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm font-medium transition-colors
            ${currentPage === 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPaginationRange().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md flex items-center gap-1 text-sm font-medium transition-colors
            ${currentPage === totalPages 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Page Info */}
      <div className="hidden sm:flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        <span className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </span>
      </div>

      {/* Mobile Page Info */}
      <div className="flex sm:hidden text-sm text-gray-700">
        <span className="font-medium">{currentPage}</span>/{totalPages}
      </div>
    </div>
  );
}
