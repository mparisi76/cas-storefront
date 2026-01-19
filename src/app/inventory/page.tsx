/* eslint-disable @next/next/no-img-element */
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import Link from "next/link";
import ShopSidebar from "@/components/ShopSidebar";
import { getCategoryTree } from "@/lib/utils";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

async function getCategories() {
  return await directus.request<Category[]>(
    readItems("categories", {
      fields: ["id", "name", "slug", { parent: ["id", "slug"] }],
      limit: -1,
    })
  );
}

async function getShopItems() {
  return await directus.request<Product[]>(
    readItems("props", {
      filter: {
        status: { _eq: "published" },
        availability: { _eq: "available" },
      },
      fields: [
        "id",
        "name",
        "thumbnail",
        "purchase_price",
        { category: ["id", "slug", "name", { parent: ["id", "slug"] }] },
      ],
    })
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>; // Must be a Promise
}) {
  // 1. ALWAYS await searchParams first in Next.js 15
  const params = await searchParams;
  const activeSlug = params.category;

  const [allItems, categories] = await Promise.all([
    getShopItems(),
    getCategories(),
  ]);

  const categoryTree = getCategoryTree(categories, allItems as Product[]);

  const filteredItems =
    !activeSlug || activeSlug === "all"
      ? allItems
      : allItems.filter(
          (item) =>
            item.category?.slug === activeSlug ||
            item.category?.parent?.slug === activeSlug
        );

  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-10 px-10">
      <div className="flex gap-16 items-start">
        <ShopSidebar tree={categoryTree} />

        <div className="flex-1">
          <div className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">
              {activeSlug ? activeSlug.replace(/-/g, ' ') : "Complete Inventory"}
            </h2>
            <p className="text-3xl font-bold uppercase tracking-tighter text-zinc-600 italic">
              {activeSlug ? "Categorized Finds" : "Selected Artifacts"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px border-t border-zinc-200">
            {filteredItems.map((item) => (
              <Link
                // FIXED: Link now points to the new /inventory path
                href={`/inventory/${item.id}`} 
                key={item.id}
                className="group bg-white border-r border-b border-zinc-200 p-10 transition-all hover:bg-zinc-50/50"
              >
                <div className="aspect-4/5 bg-zinc-100 overflow-hidden mb-8 relative">
                  {item.thumbnail ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.thumbnail}?width=800&height=1000&fit=cover`}
                      alt={item.name}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-1000 ease-in-out scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 uppercase tracking-[0.2em] text-[10px] font-bold">
                      Image Pending
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">
                      CAS—{String(item.id).padStart(4, "0")}
                    </p>
                    <h3 className="font-bold uppercase text-lg leading-tight text-zinc-600 group-hover:text-blue-600 transition-colors tracking-tight">
                      {item.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="font-light text-xl tracking-tighter text-blue-600">
                      {item.purchase_price ? `$${item.purchase_price}` : "POA"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center border border-dashed border-zinc-200 bg-white">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                No items found in this category
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
