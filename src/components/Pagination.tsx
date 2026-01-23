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
    // This reads the CURRENT filters (category, era, search) from the URL
    const params = new URLSearchParams(searchParams.toString());

    // Updates only the page
    params.set("page", page.toString());

    // Pushes the new state, triggering the Server Component to re-fetch
    router.push(`/inventory?${params.toString()}`, { scroll: true });
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-20 mb-12">
      <div className="h-px w-12 bg-zinc-200" />

      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 disabled:opacity-0 hover:text-blue-600 transition-colors"
        >
          Prev
        </button>

        <div className="flex items-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center text-[11px] font-bold transition-all
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

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 disabled:opacity-0 hover:text-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
