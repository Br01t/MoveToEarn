import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav 
      className="flex items-center justify-center gap-4 mt-6" 
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
            : 'border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-white'
        }`}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      <span className="text-sm font-mono text-gray-400" aria-live="polite">
        Page <span className="text-emerald-400 font-bold">{currentPage}</span> of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === totalPages
            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
            : 'border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-white'
        }`}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;