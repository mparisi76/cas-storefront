import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/inventory/Footer";

/** Shared shell for the 404 and error pages: same header/footer as the rest of the site. */
export function StatusPage({
  code,
  title,
  message,
  children,
}: {
  code: string;
  title: string;
  message: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6]">
      <SiteHeader />
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600/80 mb-6">{code}</p>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter italic text-zinc-900 leading-none mb-6">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 mb-10">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {children}
            <Link
              href="/inventory"
              className="bg-zinc-900 text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors"
            >
              Browse the Catalog
            </Link>
            <Link
              href="/"
              className="border border-zinc-300 text-zinc-600 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:border-zinc-900 hover:text-zinc-900 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
