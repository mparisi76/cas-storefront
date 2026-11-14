import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ShopSidebar from "@/components/inventory/ShopSidebar";
import MobileFilters from "@/components/inventory/MobileFilters";
import ArtifactCard from "@/components/inventory/ArtifactCard";
import ArtifactListItem from "@/components/inventory/ArtifactListItem";
import Pagination from "@/components/inventory/Pagination";
import EmptyState from "@/components/inventory/EmptyState";
import { ActiveFilters } from "@/components/inventory/ActiveChips";
import { getCategoryTree, flattenTree } from "@/lib/utils";
import { getCategoryCounts, getLocationCounts, getShopItems, normalizeCity, normalizeState, SORT_OPTIONS, isSortKey, type SortKey } from "@/services/(public)/artifacts";
import { LocationSelect } from "@/components/inventory/LocationFilter";
import { SoldToggle } from "@/components/inventory/SoldToggle";
import { SoldPreferenceSync } from "@/components/inventory/SoldPreferenceSync";
import { getCategories } from "@/services/categories";
import { getActiveVendors } from "@/services/(public)/vendors";
import GridIcon from "@/components/ui/icons/GridIcon";
import ListIcon from "@/components/ui/icons/ListIcon";
import ShopSkeleton from "@/components/inventory/ShopSkeleton";

export const metadata: Metadata = {
  title: "Shop Antiques, Vintage & Salvage",
  description:
    "Browse antiques, vintage and mid-century furniture, lighting, decor, and architectural salvage from dealers across the Hudson Valley and Catskills.",
  alternates: { canonical: "/inventory" },
  openGraph: {
    title: "Inventory — Catskill Architectural Salvage",
    description:
      "Antiques, vintage, mid-century, and salvage from the Hudson Valley and Catskills.",
    url: "https://catskillas.com/inventory",
  },
};

// 1. Define a strict interface for your URL parameters
interface ShopParams {
  category?: string;
  classification?: string;
  search?: string;
  page?: string;
  vendor?: string;
  view?: "grid" | "list";
  limit?: string;
  sort?: string;
  state?: string;
  city?: string;
  sold?: string;
}

// 2. Apply the type to the Results component
async function ArtifactResults({ params }: { params: ShopParams }) {
  const itemsPerPage = Number(params.limit) || 25;
  const currentPage = Number(params.page) || 1;

  const { data: items, meta } = await getShopItems({
    category: params.category || "all",
    classification: params.classification || "all",
    search: params.search || "",
    vendor: params.vendor || "all",
    state: params.state,
    city: params.city,
    hideSold: params.sold === "hide",
    page: currentPage,
    limit: itemsPerPage,
    sort: params.sort,
  });

  const totalCount = meta?.filter_count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (items.length === 0) return <EmptyState />;

  return (
    <>
      <div
        className={`${params.view === "list" ? "flex flex-col" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} border-l border-zinc-200`}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="border-r border-b border-zinc-200 bg-white overflow-hidden"
          >
            {params.view === "list" ? (
              <ArtifactListItem item={item} />
            ) : (
              <ArtifactCard item={item} />
            )}
          </div>
        ))}
      </div>
      <div className="pb-20 pt-12">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopParams>;
}) {
  const params = await searchParams;

  const activeSlug = params.category || "all";
  const activeEra = params.classification || "all";
  const activeSearch = params.search || "";
  const activeVendor = params.vendor || "all";
  const activeView = params.view || "grid";
  const itemsPerPage = Number(params.limit) || 25;
  const activeSort: SortKey = isSortKey(params.sort) ? params.sort : "featured";
  const activeState = /^[A-Za-z]{2}$/.test(params.state || "") ? normalizeState(params.state) : "";
  const activeCity = activeState ? normalizeCity(params.city) : "";
  const hideSold = params.sold === "hide";

  const [categories, counts, vendors, locations] = await Promise.all([
    getCategories(),
    getCategoryCounts({
      search: activeSearch,
      classification: activeEra,
      vendor: activeVendor,
      state: activeState,
      city: activeCity,
      hideSold,
    }),
    getActiveVendors(),
    getLocationCounts({
      category: activeSlug,
      search: activeSearch,
      classification: activeEra,
      vendor: activeVendor,
      hideSold,
    }),
  ]);

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: counts[String(cat.id)] || 0,
  }));

  const categoryTree = getCategoryTree(categoriesWithCounts);
  const allNodes = flattenTree(Object.values(categoryTree));
  const currentCategory = allNodes.find((c) => c.slug === activeSlug);
  const currentVendor = vendors.find(
    (v) => v.id === activeVendor || v.slug === activeVendor,
  );
  const isFiltered =
    activeSlug !== "all" ||
    activeEra !== "all" ||
    activeSearch !== "" ||
    activeVendor !== "all" ||
    activeState !== "";

  let displayTitle = "All Inventory";
  if (currentVendor) displayTitle = currentVendor.shop_name;
  else if (activeSearch) displayTitle = `Results for "${activeSearch}"`;
  else if (currentCategory) displayTitle = currentCategory.name;
  if (!currentVendor && !activeSearch && activeState) {
    const place = activeCity ? `${activeCity}, ${activeState}` : activeState;
    displayTitle = currentCategory ? `${currentCategory.name} in ${place}` : `Pieces in ${place}`;
  }

  const getQueryLink = (newParams: Partial<ShopParams>) => {
    const p = new URLSearchParams({
      ...(params.category && { category: params.category }),
      ...(params.classification && { classification: params.classification }),
      ...(params.search && { search: params.search }),
      ...(params.vendor && { vendor: params.vendor }),
      ...(activeState && { state: activeState }),
      ...(activeCity && { city: activeCity }),
      ...(hideSold && { sold: "hide" }),
      ...(params.view && { view: params.view }),
      ...(activeSort !== "featured" && { sort: activeSort }),
      limit: String(itemsPerPage),
      page: "1",
      ...(newParams as Record<string, string>),
    });
    if (p.get("sort") === "featured") p.delete("sort"); // default; keep URLs clean
    return `/inventory?${p.toString()}`;
  };

  const limitOptions = [25, 50, 100, 200];
  const sortLink = (key: SortKey) => getQueryLink({ sort: key });
  const sortEntries = Object.entries(SORT_OPTIONS) as [SortKey, (typeof SORT_OPTIONS)[SortKey]][];

  return (
    <main className="bg-[#F9F8F6] min-h-screen px-4 md:px-10 text-zinc-900">
      <SoldPreferenceSync />
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start relative">
        <div className="hidden lg:block w-64 sticky top-20 shrink-0 self-start pt-6">
          <ShopSidebar tree={categoryTree} vendors={vendors} locations={locations} />
        </div>

        <div className="flex-1 w-full">
          <div className="lg:hidden sticky top-0 z-50 -mx-4 px-4 bg-[#F9F8F6] border-b border-zinc-200">
            <div className="py-2.5">
              <MobileFilters
                tree={categoryTree}
                activeSlug={activeSlug}
                vendors={vendors}
              />
            </div>
            <div className="pb-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <LocationSelect locations={locations} />
              </div>
              <SoldToggle className="shrink-0" />
            </div>
            <div className="flex items-center gap-3 pb-2.5 overflow-x-auto whitespace-nowrap">
              <span className="text-detail font-bold uppercase tracking-widest text-zinc-500">Sort:</span>
              {sortEntries.map(([key, opt]) => (
                <Link
                  key={key}
                  href={sortLink(key)}
                  className={`text-detail font-black uppercase tracking-wider transition-colors ${activeSort === key ? "text-zinc-900 underline underline-offset-4" : "text-zinc-500"}`}
                >
                  {key === "price_asc" ? "Price ↑" : key === "price_desc" ? "Price ↓" : opt.label}
                </Link>
              ))}
            </div>
            <ActiveFilters vendors={vendors} className="pb-3" />
          </div>

          <div className="hidden lg:block sticky top-20 z-40 bg-[#F9F8F6] w-full">
            <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 py-6 border-b border-zinc-200">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-3 mb-1 whitespace-nowrap">
                  {currentVendor && (
                    <span className="shrink-0 text-label font-black uppercase tracking-[0.4em] text-blue-600">
                      Verified Source
                    </span>
                  )}
                  {isFiltered && (
                    <Link
                      href="/inventory"
                      className="shrink-0 text-label font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-blue-600 transition-colors"
                    >
                      [ Clear All ]
                    </Link>
                  )}
                </div>
                <h1 className="text-3xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                  {displayTitle}
                </h1>
              </div>

              <div className="ml-auto flex items-center gap-8 pb-1 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-detail font-bold uppercase tracking-widest text-zinc-500">
                    Sort:
                  </span>
                  <div className="flex gap-3">
                    {sortEntries.map(([key, opt]) => (
                      <Link
                        key={key}
                        href={sortLink(key)}
                        className={`text-label font-black uppercase tracking-wider whitespace-nowrap transition-colors ${activeSort === key ? "text-zinc-900 underline underline-offset-4" : "text-zinc-500 hover:text-zinc-900"}`}
                      >
                        {key === "price_asc" ? "Price ↑" : key === "price_desc" ? "Price ↓" : opt.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-detail font-bold uppercase tracking-widest text-zinc-500">
                    Show:
                  </span>
                  <div className="flex gap-2">
                    {limitOptions.map((opt) => (
                      <Link
                        key={opt}
                        href={getQueryLink({ limit: String(opt) })}
                        className={`text-label font-black transition-colors ${itemsPerPage === opt ? "text-zinc-900 underline underline-offset-4" : "text-zinc-500 hover:text-zinc-900"}`}
                      >
                        {opt}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex bg-white border border-zinc-200 rounded-sm p-0.5">
                  <Link
                    href={getQueryLink({ view: "grid" })}
                    className={`p-1.5 transition-colors ${activeView === "grid" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
                  >
                    <GridIcon />
                  </Link>
                  <Link
                    href={getQueryLink({ view: "list" })}
                    className={`p-1.5 border-l border-zinc-100 transition-colors ${activeView === "list" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"}`}
                  >
                    <ListIcon />
                  </Link>
                </div>
              </div>
            </header>
          </div>

          <div className="flex flex-col min-h-150">
            <Suspense
              key={JSON.stringify(params)}
              fallback={<ShopSkeleton view={activeView} />}
            >
              <ArtifactResults params={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
