/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import directus from "@/lib/directus";
import { readItems, aggregate } from "@directus/sdk";

export const revalidate = 0;

export default async function HomePage() {
  try {
    // 1. Get the total count of available items
    const countResult = await directus.request(
      aggregate("props", {
        aggregate: { count: "*" },
        query: {
          filter: {
            status: { _eq: "published" },
            thumbnail: { _nnull: true },
          },
        },
      })
    );

    const countValue = countResult?.[0]?.count ?? "0";
    const totalItems = parseInt(String(countValue));

    // 2. Pick a random index and fetch that specific item
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
      })
    );

    const heroImage = randomItems?.[0]?.thumbnail;
    const heroName = randomItems?.[0]?.name;
    const heroUrl = heroImage
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${heroImage}?width=2000&quality=75`
      : null;

    return (
      <main className="fixed inset-0 w-full h-full overflow-hidden bg-zinc-950 touch-none">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          html, body { overscroll-behavior: none; overflow: hidden; height: 100%; }
        `,
          }}
        />

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

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h2 className="mb-6 text-[10px] font-black uppercase tracking-[0.8em] text-blue-500/60">
            Hudson Valley, New York
          </h2>

          <div className="mb-14">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-white leading-tight">
              Catskill
            </h1>
            <h1 className="text-2xl md:text-5xl font-light uppercase tracking-[0.3em] text-zinc-500 -mt-2">
              Architectural Salvage
            </h1>
          </div>

          <p className="max-w-md mb-12 text-[10px] md:text-xs leading-relaxed text-zinc-500 font-medium tracking-[0.2em] uppercase italic opacity-70">
            Preserving Historical Objects • Machinery • Antiques
          </p>

          <Link
            href="/inventory"
            className="group relative border border-white/10 px-12 py-5 bg-white/2 backdrop-blur-md transition-all hover:border-blue-500/50"
          >
            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.4em] text-white group-hover:text-blue-400">
              Enter Inventory
            </span>
          </Link>
        </div>

        <div className="absolute bottom-10 w-full px-10 flex justify-between items-end z-10 text-zinc-500 pointer-events-none">
          <div className="space-y-1">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em]">
              Est. 2024 — Preservation
            </p>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em]">
              Catskill, New York
            </p>
          </div>
          <div className="text-right space-y-1">
            {heroName && (
              <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                Featured: {heroName}
              </p>
            )}
            {/* <p className="text-[9px] font-mono uppercase tracking-[0.3em]">
              Vegan Owned & Operated
            </p> */}
          </div>
        </div>
      </main>
    );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    // Basic fallback if the Directus call fails for any reason
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
