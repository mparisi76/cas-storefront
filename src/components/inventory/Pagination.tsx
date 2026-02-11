"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/inventory?${params.toString()}`, { scroll: true });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const buffer = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - buffer && i <= currentPage + buffer)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - buffer - 1 ||
        i === currentPage + buffer + 1
      ) {
        pages.push("...");
      }
    }

    return pages.filter((page, index) => {
      return page !== "..." || pages[index - 1] !== "...";
    });
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="h-px w-16 bg-zinc-200" />

      <div className="flex items-center gap-1 md:gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 md:px-4 py-2 text-detail font-black uppercase tracking-[0.2em] text-zinc-400 disabled:opacity-0 hover:text-blue-600 transition-colors shrink-0"
        >
          Prev
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-10 flex items-center justify-center text-zinc-500 font-mono"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-detail font-bold transition-all shrink-0 border
                  ${
                    currentPage === pageNum
                      ? "bg-zinc-800 text-white border-zinc-800"
                      : "text-zinc-400 border-transparent hover:text-zinc-900 hover:border-zinc-200"
                  }`}
              >
                {String(pageNum).padStart(2, "0")}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 md:px-4 py-2 text-detail font-black uppercase tracking-[0.2em] text-zinc-400 disabled:opacity-0 hover:text-blue-600 transition-colors shrink-0"
        >
          Next
        </button>
      </div>
    </div>
  );
}