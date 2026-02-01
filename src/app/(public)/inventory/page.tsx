import Link from "next/link";
import ShopSidebar from "@/components/inventory/ShopSidebar";
import MobileFilters from "@/components/inventory/MobileFilters";
import EraSelector from "@/components/inventory/EraSelector";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import ArtifactListItem from "@/components/inventory/ArtifactListItem";
import Pagination from "@/components/inventory/Pagination";
import EmptyState from "@/components/inventory/EmptyState";
import { getCategoryTree } from "@/lib/utils";
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

  // Find current vendor details for the header
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
    <main className="bg-[#F9F8F6] min-h-screen pt-6 md:pt-10 px-4 md:px-10 text-zinc-900">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        <div className="hidden lg:block w-64 sticky top-10 shrink-0">
          <ShopSidebar tree={categoryTree} vendors={vendors} />
        </div>

        <div
          className="flex-1 w-full animate-in-view"
          key={`${activeSlug}-${activeEra}-${activeSearch}-${activeVendor}-${currentPage}-${activeView}`}
        >
          {/* VENDOR SPOTLIGHT HEADER */}
          {currentVendorDetails && (
            <div className="mb-10 p-6 md:p-10 bg-white border border-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 select-none">
                <span className="text-8xl font-black italic uppercase tracking-tighter">
                  Verified
                </span>
              </div>

              <div className="relative z-10 max-w-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-blue-600"></span>
                  Verified Source
                </h3>
                <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-zinc-800 italic mb-4">
                  {currentVendorDetails.shop_name}
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed uppercase tracking-tight">
                  Curated objects and primary stock selections from{" "}
                  {currentVendorDetails.shop_name}.
                </p>
              </div>
            </div>
          )}

          {/* STANDARD HEADER SECTION */}
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-0">
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-3 h-6 mb-2">
                <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 leading-none">
                  {activeSearch
                    ? `Results for "${activeSearch}"`
                    : activeVendor !== "all"
                      ? "Source Inventory"
                      : activeSlug !== "all"
                        ? "Category"
                        : "Complete Stock"}
                  <span className="ml-2 text-zinc-500">({totalCount})</span>
                </h2>
                {isFiltered && (
                  <Link
                    href="/inventory"
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-zinc-900 flex items-center gap-1 border border-blue-100 px-2 py-1 bg-blue-50/40 transition-colors"
                  >
                    <span>✕ Clear</span>
                  </Link>
                )}
              </div>

              {!currentVendorDetails && (
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                  {activeSearch
                    ? "Filtered Search"
                    : activeSlug !== "all"
                      ? activeSlug.replace(/-/g, " ")
                      : "Selected Stock"}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex border border-zinc-200 bg-white overflow-hidden">
                <Link
                  href={getViewLink("grid")}
                  className={`p-2 transition-colors ${activeView === "grid" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-50"}`}
                >
                  <GridIcon />
                </Link>
                <Link
                  href={getViewLink("list")}
                  className={`p-2 transition-colors border-l border-zinc-200 ${activeView === "list" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-50"}`}
                >
                  <ListIcon />
                </Link>
              </div>
              <div className="hidden lg:block">
                <EraSelector
                  activeEra={activeEra}
                  params={params}
                  eraOptions={eraOptions}
                />
              </div>
            </div>
          </div>

          {/* MOBILE FILTERS */}
          <div className="lg:hidden flex flex-col gap-4 mb-8">
            <EraSelector
              activeEra={activeEra}
              params={params}
              eraOptions={eraOptions}
            />
            <MobileFilters
              tree={categoryTree}
              activeSlug={activeSlug}
              vendors={vendors}
            />
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex flex-col gap-12">
            {items.length > 0 ? (
              <>
                <div
                  className={
                    activeView === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -ml-px -mt-px"
                      : "flex flex-col -mt-px"
                  }
                >
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border-t border-r border-b border-l border-zinc-200 bg-white -ml-px -mt-px overflow-hidden"
                    >
                      {activeView === "grid" ? (
                        <ArtifactCard item={item} />
                      ) : (
                        <ArtifactListItem item={item} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pb-20 lg:pb-12 pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
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
