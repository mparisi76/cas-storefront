import Link from "next/link";
import ShopSidebar from "@/components/inventory/ShopSidebar";
import MobileFilters from "@/components/inventory/MobileFilters";
import EraSelector from "@/components/inventory/EraSelector";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import ArtifactListItem from "@/components/inventory/ArtifactListItem"; // New Import
import Pagination from "@/components/inventory/Pagination";
import { getCategoryTree } from "@/lib/utils";
import { getCategoryCounts, getShopItems } from "@/services/(public)/artifacts";
import { getCategories } from "@/services/categories";
import { getActiveVendors } from "@/services/(public)/vendors";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    classification?: string;
    search?: string;
    page?: string;
    vendor?: string;
    view?: "grid" | "list"; // New param
  }>;
}) {
  const params = await searchParams;

  const activeSlug = params.category || "all";
  const activeEra = params.classification || "all";
  const activeSearch = params.search || "";
  const activeVendor = params.vendor || "all";
  const activeView = params.view || "grid"; // Default to grid
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 12;

  const [{ data: items, meta }, categories, counts, vendors] =
    await Promise.all([
      getShopItems({
        category: activeSlug,
        classification: activeEra,
        search: activeSearch,
        vendor: activeVendor,
        page: currentPage,
        limit: itemsPerPage,
      }),
      getCategories(),
      getCategoryCounts({
        search: activeSearch,
        classification: activeEra,
        vendor: activeVendor,
      }),
      getActiveVendors(),
    ]);

  const totalCount = meta?.filter_count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: counts[String(cat.id)] || 0,
  }));

  const categoryTree = getCategoryTree(categoriesWithCounts, []);
  const eraOptions = ["all", "antique", "vintage", "modern"];
  const isFiltered = activeSlug !== "all" || activeEra !== "all" || activeSearch !== "" || activeVendor !== "all";

  // Helper to maintain current params when toggling view
  const getViewLink = (viewType: string) => {
    const p = new URLSearchParams({
      ...(params.category && { category: params.category }),
      ...(params.classification && { classification: params.classification }),
      ...(params.search && { search: params.search }),
      ...(params.vendor && { vendor: params.vendor }),
      ...(params.page && { page: params.page }),
      view: viewType,
    });
    return `/inventory?${p.toString()}`;
  };

  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-6 md:pt-10 px-4 md:px-10 text-zinc-900">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        <div className="hidden lg:block w-64 sticky top-10 shrink-0">
          <ShopSidebar tree={categoryTree} vendors={vendors} />
        </div>

        <div className="flex-1 w-full animate-in-view" key={`${activeSlug}-${activeEra}-${activeSearch}-${activeVendor}-${currentPage}-${activeView}`}>
          
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-0">
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-3 h-6 mb-2">
                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 leading-none">
                  {activeSearch ? `Results for "${activeSearch}"` : activeSlug !== "all" ? "Category" : "Complete Inventory"}
                  <span className="ml-2 text-zinc-500">({totalCount})</span>
                </h2>
                {isFiltered && (
                  <Link href="/inventory" className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-zinc-900 flex items-center gap-1 border border-blue-100 px-2 py-1 bg-blue-50/40 transition-colors">
                    <span>✕ Clear</span>
                  </Link>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                {activeSearch ? "Filtered Search" : activeSlug !== "all" ? activeSlug.replace(/-/g, " ") : "Selected Artifacts"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* VIEW TOGGLE */}
              <div className="flex border border-zinc-200 bg-white overflow-hidden">
                <Link 
                  href={getViewLink('grid')}
                  className={`p-2 transition-colors ${activeView === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-50'}`}
                >
                  <GridIcon />
                </Link>
                <Link 
                  href={getViewLink('list')}
                  className={`p-2 transition-colors border-l border-zinc-200 ${activeView === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-50'}`}
                >
                  <ListIcon />
                </Link>
              </div>

              <div className="hidden lg:block">
                <EraSelector activeEra={activeEra} params={params} eraOptions={eraOptions} />
              </div>
            </div>
          </div>

          <div className="lg:hidden flex flex-col gap-4 mb-8">
            <EraSelector activeEra={activeEra} params={params} eraOptions={eraOptions} />
            <MobileFilters tree={categoryTree} activeSlug={activeSlug} vendors={vendors} />
          </div>

          <div className="flex flex-col gap-12">
            {items.length > 0 ? (
              <>
                {/* DYNAMIC LAYOUT BASED ON VIEW */}
                <div className={activeView === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -ml-px -mt-px" 
                  : "flex flex-col -mt-px"
                }>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border-t border-r border-b border-l border-zinc-200 bg-white -ml-px -mt-px overflow-hidden"
                    >
                      {activeView === 'grid' ? (
                        <ArtifactCard item={item} />
                      ) : (
                        <ArtifactListItem item={item} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pb-20 lg:pb-12 pt-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              </>
            ) : (
              <div className="py-20 md:py-32 text-center border border-dashed border-zinc-200 bg-white/50">
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-bold">No artifacts match your selection</p>
                <Link href="/inventory" className="mt-6 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-200 px-6 py-3 hover:bg-blue-600 hover:text-white transition-all">Clear All Filters</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Simple Icon Components
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
}
