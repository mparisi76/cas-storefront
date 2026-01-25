import Link from "next/link";
import ShopSidebar from "@/components/inventory/ShopSidebar";
import MobileFilters from "@/components/inventory/MobileFilters";
import EraSelector from "@/components/inventory/EraSelector";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import Pagination from "@/components/inventory/Pagination";
import { getCategoryTree } from "@/lib/utils";
import { getCategoryCounts, getShopItems } from "@/services/(public)/artifacts";
import { getCategories } from "@/services/categories";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    classification?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  // 1. Extract params with defaults
  const activeSlug = params.category || "all";
  const activeEra = params.classification || "all";
  const activeSearch = params.search || "";
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 12;

  // 2. Fetch all data in parallel
  const [{ data: items, meta }, categories, counts] = await Promise.all([
    getShopItems({
      category: activeSlug,
      classification: activeEra,
      search: activeSearch,
      page: currentPage,
      limit: itemsPerPage,
    }),
    getCategories(),
    getCategoryCounts({
      search: activeSearch,
      classification: activeEra,
    }),
  ]);

  // 3. UI State & Pagination calculations
  const totalCount = meta?.filter_count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 4. Map the counts to the categories
  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: counts[String(cat.id)] || 0,
  }));

  const categoryTree = getCategoryTree(categoriesWithCounts, []);
  const eraOptions = ["all", "antique", "vintage", "modern"];
  const isFiltered =
    activeSlug !== "all" || activeEra !== "all" || activeSearch !== "";

  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-6 md:pt-10 px-4 md:px-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block w-64 sticky top-10 shrink-0">
          <ShopSidebar tree={categoryTree} />
        </div>

        <div
          className="flex-1 w-full animate-in-view"
          key={`${activeSlug}-${activeEra}-${activeSearch}-${currentPage}`}
        >
          {/* HEADER SECTION */}
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-0">
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-3 h-6 mb-2">
                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 leading-none">
                  {activeSearch
                    ? `Results for "${activeSearch}"`
                    : activeSlug !== "all"
                      ? "Category"
                      : "Complete Inventory"}
                  <span className="ml-2 text-zinc-300">({totalCount})</span>
                </h2>

                {isFiltered && (
                  <Link
                    href="/inventory"
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-zinc-900 flex items-center gap-1 border border-blue-100 px-2 py-1 bg-blue-50/40 transition-colors"
                  >
                    <span>✕</span>
                    <span>Clear</span>
                  </Link>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                {activeSearch
                  ? "Filtered Search"
                  : activeSlug !== "all"
                    ? activeSlug.replace(/-/g, " ")
                    : "Selected Artifacts"}
              </h1>
            </div>

            <div className="hidden lg:block">
              <EraSelector
                activeEra={activeEra}
                params={params}
                eraOptions={eraOptions}
              />
            </div>
          </div>

          {/* MOBILE FILTERS */}
          <div className="lg:hidden flex flex-col gap-4 mb-8">
            <EraSelector
              activeEra={activeEra}
              params={params}
              eraOptions={eraOptions}
            />
            <MobileFilters tree={categoryTree} activeSlug={activeSlug} />
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex flex-col gap-12">
            {items.length > 0 ? (
              <>
                {/* The grid container is transparent and has no borders.
                  Negative margins allow the item borders to overlap perfectly.
                */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -ml-px -mt-px">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border-t border-r border-b border-l border-zinc-200 bg-white -ml-px -mt-px overflow-hidden"
                    >
                      <ArtifactCard item={item} />
                    </div>
                  ))}
                </div>

                {/* PAGINATION WRAPPER */}
                <div className="pb-20 lg:pb-12 pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                </div>
              </>
            ) : (
              /* EMPTY STATE */
              <div className="py-20 md:py-32 text-center border border-dashed border-zinc-200 bg-white/50 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-xs mx-auto space-y-6 px-6">
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
                    No artifacts match your current selection
                  </p>
                  <div className="h-px w-8 bg-zinc-200 mx-auto" />
                  <Link
                    href="/inventory"
                    className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-200 px-6 py-3 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                  >
                    Clear All Filters
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
