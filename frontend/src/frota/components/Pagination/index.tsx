import React from 'react';
import './styles.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null; // Não mostra a paginação se houver apenas uma página
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      <button 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
        className="pagination-button"
      >
        <ChevronLeft size={16} />
        Anterior
      </button>
      
      <span className="pagination-info">
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
      </span>

      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Próximo
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
