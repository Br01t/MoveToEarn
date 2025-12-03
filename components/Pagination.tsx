
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
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
            : 'border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-white'
        }`}
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-sm font-mono text-gray-400">
        Page <span className="text-emerald-400 font-bold">{currentPage}</span> of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === totalPages
            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
            : 'border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-white'
        }`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;