import Link from "next/link";
import ShopSidebar from "@/components/inventory/ShopSidebar";
import MobileFilters from "@/components/inventory/MobileFilters";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import ArtifactListItem from "@/components/inventory/ArtifactListItem";
import Pagination from "@/components/inventory/Pagination";
import EmptyState from "@/components/inventory/EmptyState";
import { ActiveFilters } from "@/components/inventory/ActiveChips";
import { getCategoryTree, flattenTree } from "@/lib/utils";
import { getCategoryCounts, getShopItems } from "@/services/(public)/artifacts";
import { getCategories } from "@/services/categories";
import { getActiveVendors } from "@/services/(public)/vendors";
import GridIcon from "@/components/ui/icons/GridIcon";
import ListIcon from "@/components/ui/icons/ListIcon";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    classification?: string;
    search?: string;
    page?: string;
    vendor?: string;
    view?: "grid" | "list";
  }>;
}) {
  const params = await searchParams;

  const activeSlug = params.category || "all";
  const activeEra = params.classification || "all";
  const activeSearch = params.search || "";
  const activeVendor = params.vendor || "all";
  const activeView = params.view || "grid";
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

  const categoryTree = getCategoryTree(categoriesWithCounts);
  
  const allNodes = flattenTree(Object.values(categoryTree));
  const currentCategory = allNodes.find(c => c.slug === activeSlug);
  const currentVendor = vendors.find((v) => v.id === activeVendor || v.slug === activeVendor);

  let displayTitle = "All Inventory";
  if (currentVendor) displayTitle = currentVendor.shop_name;
  else if (activeSearch) displayTitle = `Results for "${activeSearch}"`;
  else if (currentCategory) displayTitle = currentCategory.name;

  const isFiltered = activeSlug !== "all" || activeEra !== "all" || activeSearch !== "" || activeVendor !== "all";

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
    <main className="bg-[#F9F8F6] min-h-screen px-4 md:px-10 text-zinc-900">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start relative">
        
        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block w-64 sticky top-20 shrink-0 self-start pt-6">
          <ShopSidebar tree={categoryTree} vendors={vendors} />
        </div>

        <div className="flex-1 w-full">
          
          {/* MOBILE NAV */}
          <div className="lg:hidden sticky top-0 z-50 -mx-4 px-4 bg-[#F9F8F6] border-b border-zinc-200">
            <div className="py-2.5">
              <MobileFilters tree={categoryTree} activeSlug={activeSlug} vendors={vendors} />
            </div>
            <ActiveFilters vendors={vendors} className="pb-3" />
          </div>

          {/* DESKTOP HEADER */}
          <div className="hidden lg:block sticky top-20 z-40 bg-[#F9F8F6] w-full">
            <header className="flex items-end justify-between py-6 border-b border-zinc-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  {currentVendor && (
                    <span className="text-label font-black uppercase tracking-[0.4em] text-blue-600">
                      Verified Source
                    </span>
                  )}
                  {isFiltered && (
                    <Link 
                      href="/inventory" 
                      className="text-label font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-blue-600 transition-colors"
                    >
                      [ Clear All ]
                    </Link>
                  )}
                </div>
                <h1 className="text-3xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                  {displayTitle}
                </h1>
              </div>
              
              <div className="flex items-center gap-6 pb-1">
                <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500">
                  {totalCount} Objects
                </span>

                <div className="flex bg-white border border-zinc-200 rounded-sm p-0.5">
                  <Link 
                    href={getViewLink("grid")} 
                    className={`p-1.5 transition-colors ${activeView === "grid" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"}`}
                  >
                    <GridIcon />
                  </Link>
                  <Link 
                    href={getViewLink("list")} 
                    className={`p-1.5 border-l border-zinc-100 transition-colors ${activeView === "list" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"}`}
                  >
                    <ListIcon />
                  </Link>
                </div>
              </div>
            </header>
          </div>

          {/* GRID */}
          <div className="flex flex-col" key={`${activeSlug}-${activeEra}-${activeSearch}-${activeVendor}-${currentPage}-${activeView}`}>
            {items.length > 0 ? (
              <>
                <div className={`${activeView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"} border-l border-zinc-200`}>
                  {items.map((item) => (
                    <div key={item.id} className="border-r border-b border-zinc-200 bg-white overflow-hidden">
                      {activeView === "grid" ? <ArtifactCard item={item} /> : <ArtifactListItem item={item} />}
                    </div>
                  ))}
                </div>
                <div className="pb-20 pt-12">
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}