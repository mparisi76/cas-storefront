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
            Curators of antique, vintage, and industrial remnants. <br />
            Based in the Hudson Valley, NY.
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-2">
            <span className="text-tiny font-black uppercase tracking-[0.2em] text-zinc-300">Navigation</span>
            <Link href="/inventory" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Catalog</Link>
            <Link href="/about" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">About</Link>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-tiny font-black uppercase tracking-[0.2em] text-zinc-300">Connect</span>
            <a href="mailto:info@catskillas.com" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Email</a>
            <a href="https://instagram.com" className="text-label uppercase tracking-widest text-zinc-500 hover:text-blue-600 transition-colors">Instagram</a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-between items-center">
        <p className="text-tiny text-zinc-300 uppercase tracking-widest">
          © {currentYear} Catskill Architectural Salvage
        </p>
      </div>
    </footer>
  );
}