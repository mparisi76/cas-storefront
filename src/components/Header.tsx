'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F8F6]/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-2">
        <div className="flex h-20 items-center justify-between">
          
          {/* Left: Navigation (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 transition-colors">
              Catalog
            </Link>
            <Link href="/archives" className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 transition-colors">
              Archives
            </Link>
          </nav>

          {/* Center: Brand Identity */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <Link href="/" className="group">
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-[0.4em] text-zinc-600 leading-none">
                Catskill
              </h1>
              <p className="text-[9px] uppercase tracking-[0.6em] text-zinc-600 font-medium mt-1 group-hover:text-blue-600 transition-colors">
                Architectural Salvage
              </p>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-600 hover:text-zinc-800 cursor-pointer transition-colors">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link href="/cart" className="p-2 text-zinc-600 hover:text-zinc-800 transition-colors">
              <ShoppingBag size={18} strokeWidth={1.5} />
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-zinc-500 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-[#F9F8F6] z-50 p-8 animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-8">
            <Link 
              href="/" 
              className="text-2xl font-bold uppercase tracking-tighter text-zinc-600 italic border-b border-zinc-200 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catalog
            </Link>
            <Link 
              href="/archives" 
              className="text-2xl font-bold uppercase tracking-tighter text-zinc-600 italic border-b border-zinc-200 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Archives
            </Link>
            <Link 
              href="/about" 
              className="text-2xl font-bold uppercase tracking-tighter text-zinc-600 italic border-b border-zinc-200 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About the Shop
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}