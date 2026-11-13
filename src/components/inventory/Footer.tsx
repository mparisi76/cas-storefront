"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white py-12 px-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h3 className="text-detail font-black uppercase tracking-[0.4em] text-zinc-800 mb-4">
            Catskill Architectural Salvage
          </h3>
          <p className="text-label text-zinc-600 uppercase tracking-widest leading-relaxed max-w-xs">
            Antiques, vintage, mid-century &amp; salvage, <br />
            from small finds to architectural pieces. <br />
            Based in the Hudson Valley, NY.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-8 md:shrink-0">
          <div className="flex flex-col gap-2">
            <span className="text-tiny font-black uppercase tracking-[0.2em] text-zinc-500">Navigation</span>
            <Link href="/inventory" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Catalog</Link>
            <Link href="/about" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">About</Link>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-tiny font-black uppercase tracking-[0.2em] text-zinc-500">Policies</span>
            <Link href="/returns" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Shipping &amp; Returns</Link>
            <Link href="/terms" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Privacy</Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-tiny font-black uppercase tracking-[0.2em] text-zinc-500">Connect</span>
            <a href="mailto:info@catskillas.com" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Email</a>
            <a href="https://instagram.com" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Instagram</a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-between items-center">
        <p className="text-tiny text-zinc-500 uppercase tracking-widest">
          © {currentYear} Catskill Architectural Salvage
        </p>
      </div>
    </footer>
  );
}