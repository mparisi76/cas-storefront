/* eslint-disable @next/next/no-img-element */
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import Link from "next/link";
import ShopSidebar from "@/components/ShopSidebar";
import { getCategoryTree } from "@/lib/utils";
import { Category } from "@/types/category";
import { Artifact } from "@/types/product";

async function getCategories() {
  return await directus.request<Category[]>(
    readItems("categories", {
      fields: ["id", "name", "slug", { parent: ["id", "slug"] }],
      limit: -1,
    }),
  );
}

async function getShopItems() {
  return await directus.request<Artifact[]>(
    readItems("props", {
      filter: {
        _and: [
          { status: { _eq: "published" } },
          { availability: { _in: ["available", "sold"] } },
        ],
      },
      fields: [
        "id",
        "name",
        "thumbnail",
        "purchase_price",
        "availability",
        "classification", // CRITICAL: Added so the filter has data to work with
        { category: ["id", "slug", "name", { parent: ["id", "slug"] }] },
      ],
    }),
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; classification?: string }>;
}) {
  const params = await searchParams;
  const activeSlug = params.category;
  const activeEra = params.classification;

  const [allItems, categories] = await Promise.all([
    getShopItems(),
    getCategories(),
  ]);

  const categoryTree = getCategoryTree(categories, allItems as Artifact[]);

  // Filtering logic using the classification field now included in the query
  const filteredItems = allItems.filter((item) => {
    const matchesCategory =
      !activeSlug ||
      activeSlug === "all" ||
      item.category?.slug === activeSlug ||
      item.category?.parent?.slug === activeSlug;

    const matchesEra =
      !activeEra || activeEra === "all" || item.classification === activeEra;

    return matchesCategory && matchesEra;
  });

  const eraOptions = ["all", "antique", "vintage", "modern"];

  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-10 px-10">
      <div className="flex gap-16 items-start">
        <div className="w-64 sticky top-10 shrink-0">
          <ShopSidebar tree={categoryTree} />
        </div>

        <div className="flex-1">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-2 leading-none">
                {activeSlug
                  ? activeSlug.replace(/-/g, " ")
                  : "Complete Inventory"}
              </h2>
              <p className="text-3xl font-bold uppercase tracking-tighter text-zinc-600 italic leading-none">
                {activeSlug ? "Categorized Finds" : "Selected Artifacts"}
              </p>
            </div>

            <div className="flex items-baseline gap-8 border-b border-zinc-200 pb-2">
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-800 leading-none">
                Era:
              </span>
              <div className="flex items-baseline gap-6">
                {eraOptions.map((era) => (
                  <Link
                    key={era}
                    href={{
                      pathname: "/inventory",
                      query: { ...params, classification: era },
                    }}
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-1 leading-none ${
                      activeEra === era || (!activeEra && era === "all")
                        ? "text-blue-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-blue-600"
                        : "text-zinc-400 hover:text-zinc-800"
                    }`}
                  >
                    {era}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px border-t border-zinc-200">
            {filteredItems.map((item) => {
              const isSold = item.availability === "sold";

              return (
                <Link
                  href={`/inventory/${item.id}`}
                  key={item.id}
                  className={`group bg-white border-r border-b border-zinc-200 p-10 transition-all ${
                    isSold ? "opacity-90" : "hover:bg-zinc-50/50"
                  }`}
                >
                  <div className="aspect-4/5 bg-zinc-100 overflow-hidden mb-8 relative">
                    {isSold && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#F9F8F6]/40 backdrop-blur-[1px]">
                        <div className="border-2 border-zinc-800 px-4 py-1 text-zinc-800 font-black uppercase tracking-[0.3em] -rotate-12 text-xs shadow-sm bg-white">
                          Sold
                        </div>
                      </div>
                    )}

                    {item.thumbnail ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}?width=800&height=1000&fit=inside`}
                        alt={item.name}
                        className={`object-contain w-full h-full transition-all duration-1000 ease-in-out ${
                          isSold
                            ? "grayscale contrast-75"
                            : "grayscale group-hover:grayscale-0"
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 uppercase tracking-[0.2em] text-[11px] font-bold">
                        Image Pending
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">
                        CAS—{String(item.id).padStart(4, "0")}
                      </p>
                      <h3
                        className={`font-bold uppercase text-lg leading-tight transition-colors tracking-tight ${
                          isSold
                            ? "text-zinc-600"
                            : "text-zinc-600 group-hover:text-blue-600"
                        }`}
                      >
                        {item.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span
                        className={`${isSold ? "text-zinc-600 font-mono text-[11px] italic" : "text-blue-600"}`}
                      >
                        {isSold
                          ? "[ OUT OF STOCK ]"
                          : item.purchase_price
                            ? `$${Number(item.purchase_price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                            : "POA"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center border border-dashed border-zinc-200 bg-white">
              <p className="text-[11px] uppercase tracking-widest text-zinc-600 font-bold">
                No items found for this selection
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
