import Link from "next/link";
import ShopSidebar from "@/components/inventory/ShopSidebar";
import MobileFilters from "@/components/inventory/MobileFilters";
import EraSelector from "@/components/inventory/EraSelector";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import ArtifactListItem from "@/components/inventory/ArtifactListItem";
import Pagination from "@/components/inventory/Pagination";
import EmptyState from "@/components/inventory/EmptyState";
import { ActiveFilters } from "@/components/inventory/ActiveChips";
import { getCategoryTree } from "@/lib/utils";
import { getCategoryCounts, getShopItems } from "@/services/(public)/artifacts";
import { getCategories } from "@/services/categories";
import { getActiveVendors } from "@/services/(public)/vendors";
import GridIcon from "@/components/ui/icons/GridIcon";
import ListIcon from "@/components/ui/icons/ListIcon";
import { PublicVendor } from "@/types/vendor";

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

  const currentVendorDetails = vendors.find((v) => v.id === activeVendor);
  const totalCount = meta?.filter_count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: counts[String(cat.id)] || 0,
  }));

  const categoryTree = getCategoryTree(categoriesWithCounts, []);
  const eraOptions = ["all", "antique", "vintage", "modern"];
  
  const isFiltered =
    activeSlug !== "all" ||
    activeEra !== "all" ||
    activeSearch !== "" ||
    activeVendor !== "all";

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
    <main className="bg-[#F9F8F6] min-h-screen pt-4 md:pt-10 px-4 md:px-10 text-zinc-900">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        
        <div className="hidden lg:block w-64 sticky top-10 shrink-0">
          <ShopSidebar tree={categoryTree} vendors={vendors} />
        </div>

        <div className="flex-1 w-full animate-in-view" key={`${activeSlug}-${activeEra}-${activeSearch}-${activeVendor}-${currentPage}-${activeView}`}>
          
          {currentVendorDetails && (
            <div className="mb-6 md:mb-10 p-6 md:p-10 bg-white border border-zinc-200">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">Verified Source</h3>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-zinc-800 italic">{currentVendorDetails.shop_name}</h1>
            </div>
          )}

          {/* STICKY MOBILE HEADER: FIXED HEIGHT & LOGIC */}
          <div className="lg:hidden sticky top-0 z-[70] -mx-4 px-4 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-zinc-200">
            {/* ERA SECTION: Restricted to 40px height */}
            <div className="border-b border-zinc-200/50">
              <EraSelector 
                activeEra={activeEra} 
                params={params} 
                eraOptions={eraOptions} 
                className="h-10" 
              />
            </div>

            {/* FILTER DROPDOWNS: Side-by-Side row */}
            <div className="py-2.5">
              <MobileFilters 
                tree={categoryTree} 
                activeSlug={activeSlug} 
                vendors={vendors} 
              />
            </div>

            <ActiveFilters vendors={vendors} className="pb-3" />
          </div>

          <header className="hidden lg:flex flex-col gap-4 mb-8">
            <div className="flex items-baseline justify-between border-b border-zinc-200 pb-5">
              <h1 className="text-5xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                {activeSearch ? `Results for "${activeSearch}"` : "The Yard Inventory"}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{totalCount} Objects</span>
                {isFiltered && (
                  <Link href="/inventory" className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-zinc-900 border-b border-blue-600/20">Reset</Link>
                )}
              </div>
            </div>
          </header>

          <div className="hidden lg:flex items-center justify-between mb-8 py-2 border-b border-zinc-100">
            <EraSelector activeEra={activeEra} params={params} eraOptions={eraOptions} />
            <div className="flex bg-white border border-zinc-200 rounded-sm p-0.5">
              <Link href={getViewLink("grid")} className={`p-1.5 ${activeView === "grid" ? "bg-zinc-900 text-white" : "text-zinc-400"}`}><GridIcon /></Link>
              <Link href={getViewLink("list")} className={`p-1.5 border-l border-zinc-100 ${activeView === "list" ? "bg-zinc-900 text-white" : "text-zinc-400"}`}><ListIcon /></Link>
            </div>
          </div>

          <div className="flex flex-col gap-8 mt-6 lg:mt-0">
            {items.length > 0 ? (
              <>
                <div className={activeView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -ml-px -mt-px" : "flex flex-col"}>
                  {items.map((item) => (
                    <div key={item.id} className="border border-zinc-200 bg-white -ml-px -mt-px overflow-hidden">
                      {activeView === "grid" ? <ArtifactCard item={item} /> : <ArtifactListItem item={item} />}
                    </div>
                  ))}
                </div>
                <div className="pb-20 pt-8">
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