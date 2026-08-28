import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Architectural salvage, antique hardware, and reclaimed building materials from our own warehouse and a directory of dealers across the Hudson Valley and Catskills.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F9F8F6] text-zinc-800 pb-32">
      <div className="max-w-2xl mx-auto px-6 md:px-8 pt-20 md:pt-32">
        {/* HERO */}
        <header className="mb-20 pb-10 border-b border-zinc-200">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600/70 mb-6">
            Hudson Valley, New York
          </p>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-[0.95] text-zinc-900 mb-8">
            For the second life
            <br />
            of old buildings.
          </h1>
          <p className="text-lg leading-relaxed text-zinc-600 max-w-xl">
            Every year, houses get gutted and barns get flattened across the
            Hudson Valley. The good stuff — the hand-planed floors, the mortise
            locks, the beadboard, the beams — usually ends up in a dumpster.
            This is a small effort to route more of it to the people who&rsquo;d
            rather live with it than replace it.
          </p>
        </header>

        {/* WHAT THIS IS */}
        <section className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">
            What this is
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-zinc-700">
            <p>
              Catskill Architectural Salvage is two things at once: a working
              shop and a regional directory.
            </p>
            <p>
              The shop is our own inventory — pieces from Charley&rsquo;s
              warehouse, brought out and cataloged as we work through decades of
              what he collected. If you buy one of ours, you&rsquo;re buying
              from us directly.
            </p>
            <p>
              The directory indexes the shops, dealers, and one-person
              operations across the region who spend their days finding,
              hauling, cleaning, and reselling architectural salvage. When you
              buy from a directory dealer, the transaction happens with them —
              we&rsquo;re an on-ramp, not a middleman.
            </p>
          </div>
        </section>

        {/* WHY IT EXISTS — PERSONAL */}
        <section className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">
            Why it exists
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-zinc-700">
            <p>
              My grandfather Charley ran an auction business out of Cairo
              through the 1960s and 70s. When he stopped, he left behind a
              warehouse of the pieces he&rsquo;d collected along the way — the
              good stuff nobody else quite knew what to do with. Catskill
              Architectural Salvage began as a plan to catalog and share that
              inventory, and it&rsquo;s still where we&rsquo;re headed.
            </p>
            <p>
              As we got closer to it, we realized the same problem existed for
              every small dealer in the region: they had beautiful things and no
              easy way to be found. So the site is growing into something bigger
              — a directory for the shops, pickers, and one-person operations
              doing this work today, alongside the pieces still waiting in
              Charley&rsquo;s warehouse.
            </p>
          </div>
        </section>

        {/* FOR DEALERS */}
        <section className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">
            For dealers
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-zinc-700">
            <p>
              If you run a salvage yard, an architectural antiques shop, or a
              barn-emptying side hustle, you can list your inventory here.
              We&rsquo;re early and we don&rsquo;t charge for listings. The
              pitch is simple: you keep doing what you&rsquo;re good at, and we
              drive buyers your way.
            </p>
            <p>
              <Link
                href="/contact?type=vendor"
                className="text-blue-600 hover:text-zinc-900 border-b border-blue-600/40 hover:border-zinc-900 transition-colors pb-0.5"
              >
                Get in touch about a storefront →
              </Link>
            </p>
          </div>
        </section>

        {/* REGION */}
        <section className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">
            The region
          </h2>
          <div className="space-y-6 text-base leading-relaxed text-zinc-700">
            <p>
              We&rsquo;re rooted in the Hudson Valley and the Catskills —
              roughly Albany south through Kingston, Rhinebeck, Hudson,
              Catskill, Woodstock, Poughkeepsie, and Beacon, and everywhere in
              between. Many pieces can be shipped anywhere; others are better
              seen in person and picked up locally. Either way, the region is
              where the inventory lives and where the dealers work.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-10 border-t border-zinc-200 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-400">
              Est. 2024 — Preservation
            </p>
            <Link
              href="/inventory"
              className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-900 hover:text-blue-600 transition-colors border-b border-zinc-900 hover:border-blue-600 pb-1 self-start"
            >
              Browse Inventory →
            </Link>
          </div>
          <Link
            href="/contact"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Contact
          </Link>
        </footer>
      </div>
    </main>
  );
}
