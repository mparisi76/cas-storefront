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

  // Hide component if there is only one page
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    // Read the current filters from the URL to preserve search/category/era
    const params = new URLSearchParams(searchParams.toString());

    // Update the page parameter
    params.set("page", page.toString());

    // Navigate to the updated URL and scroll to top for better UX
    router.push(`/inventory?${params.toString()}`, { scroll: true });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Decorative Divider */}
      <div className="h-px w-12 bg-zinc-200" />

      <div className="flex items-center gap-1 md:gap-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 md:px-4 py-2 text-detail font-black uppercase tracking-[0.2em] text-zinc-400 disabled:opacity-0 hover:text-blue-600 transition-colors shrink-0"
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="flex items-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-label font-bold transition-all shrink-0
                ${
                  currentPage === page
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 md:px-4 py-2 text-detail font-black uppercase tracking-[0.2em] text-zinc-400 disabled:opacity-0 hover:text-blue-600 transition-colors shrink-0"
        >
          Next
        </button>
      </div>
    </div>
  );
}