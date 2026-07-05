import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
  };

  return (
    <div className="pagination flex items-center justify-center gap-4 mt-6">
      <button
        className="pagination__btn min-h-[44px] min-w-[44px] px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handlePrev}
        disabled={currentPage === 0}
        aria-label="Trang trước"
      >
        Trước
      </button>
      
      <span className="pagination__info text-sm text-gray-600 font-medium" aria-live="polite">
        Trang {currentPage + 1} / {totalPages}
      </span>

      <button
        className="pagination__btn min-h-[44px] min-w-[44px] px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        aria-label="Trang sau"
      >
        Sau
      </button>
    </div>
  );
};

export default Pagination;
