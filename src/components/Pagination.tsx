import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  pageWindow?: number; // optional, number of pages to show
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPage, onPageChange, pageWindow = 5 }) => {
  if (totalPage <= 1) return null;

  // Calculate start and end page
  const halfWindow = Math.floor(pageWindow / 2);
  let startPage = Math.max(currentPage - halfWindow, 1);
  let endPage = startPage + pageWindow - 1;

  if (endPage > totalPage) {
    endPage = totalPage;
    startPage = Math.max(endPage - pageWindow + 1, 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {startPage > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => onPageChange(page)}>
          {page}
        </Button>
      ))}

      {endPage < totalPage && (
        <>
          {endPage < totalPage - 1 && <span className="px-2">...</span>}
          <Button variant="outline" size="sm" onClick={() => onPageChange(totalPage)}>
            {totalPage}
          </Button>
        </>
      )}

      <Button variant="outline" size="sm" disabled={currentPage === totalPage} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
