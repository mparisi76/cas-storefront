/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import directus from "@/lib/directus";
import { readItems, aggregate } from "@directus/sdk";
import { getFeaturedVendors } from "@/services/(public)/vendors";
import FeaturedShops from "@/components/inventory/FeaturedShops";

export const revalidate = 0;

export default async function HomePage() {
  try {
    const [countResult, featuredVendors] = await Promise.all([
      directus.request(
        aggregate("props", {
          aggregate: { count: "*" },
          query: {
            filter: {
              status: { _eq: "published" },
              thumbnail: { _nnull: true },
            },
          },
        }),
      ),
      getFeaturedVendors(),
    ]);

    const countValue = countResult?.[0]?.count ?? "0";
    const totalItems = parseInt(String(countValue));
    const randomIndex = Math.floor(Math.random() * totalItems);

    const randomItems = await directus.request(
      readItems("props", {
        filter: {
          status: { _eq: "published" },
          thumbnail: { _nnull: true },
        },
        limit: 1,
        offset: randomIndex,
        fields: ["thumbnail", "name"],
      }),
    );

    const heroImage = randomItems?.[0]?.thumbnail;
    const heroName = randomItems?.[0]?.name;
    const heroUrl = heroImage
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${heroImage}?width=2000&quality=75`
      : null;

    return (
      <main className="relative w-full min-h-screen bg-zinc-950 text-zinc-900">
        {/* HERO SECTION */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            {heroUrl ? (
              <img
                src={heroUrl}
                alt={heroName || "Catskill Architectural Salvage"}
                className="h-full w-full object-cover opacity-20 grayscale"
              />
            ) : (
              <div className="h-full w-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-zinc-950/20 via-transparent to-zinc-950" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
            <h2 className="mb-6 text-[10px] font-black uppercase tracking-[0.8em] text-blue-500/60">
              Hudson Valley, New York
            </h2>

            {/* HEADER GROUP - Removed negative margin, added flex gap */}
            <div className="mb-14 flex flex-col items-center gap-1 md:gap-2">
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
                Catskill
              </h1>
              <h1 className="text-xl md:text-5xl font-light uppercase tracking-[0.3em] text-zinc-500 leading-none">
                Architectural Salvage
              </h1>
            </div>

            <p className="max-w-md mb-12 text-[10px] md:text-xs leading-relaxed text-zinc-400 font-medium tracking-[0.2em] uppercase italic opacity-90">
              Carefully Curated Objects • Machinery • Antiques
            </p>

            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              <Link
                href="/inventory"
                className="group w-full relative border border-white/20 px-12 py-5 bg-white/5 backdrop-blur-md transition-all hover:border-blue-500/50 hover:bg-white/10"
              >
                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] text-white group-hover:text-blue-400">
                  View Inventory
                </span>
              </Link>

              <Link
                href="/login"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white border-b border-transparent hover:border-white transition-all pb-1"
              >
                Merchant Access
              </Link>
            </div>
          </div>

          {/* Floating Hero Info */}
          <div className="absolute bottom-10 left-10 hidden md:block z-20">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-600">
              Est. 2024 — Preservation
            </p>
          </div>

          <div className="absolute bottom-10 right-10 z-20">
            {heroName && (
              <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-600">
                Featured: {heroName}
              </p>
            )}
          </div>
        </section>

        <FeaturedShops vendors={featuredVendors} />

        <footer className="bg-white py-10 px-10 border-t border-zinc-100 flex justify-between items-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-400">
            © 2026 Catskill Architectural Salvage
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[9px] font-mono uppercase text-zinc-400 hover:text-zinc-900"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[9px] font-mono uppercase text-zinc-400 hover:text-zinc-900"
            >
              Terms
            </Link>
          </div>
        </footer>
      </main>
    );
  } catch {
    return (
      <main className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <Link
          href="/inventory"
          className="text-white text-[10px] uppercase tracking-[0.5em] border border-white/20 px-10 py-4"
        >
          Enter Inventory
        </Link>
      </main>
    );
  }
}