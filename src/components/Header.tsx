'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", searchQuery.trim());
    
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(`/inventory?${params.toString()}`);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F8F6] border-b border-zinc-200">
      <div className="mx-auto px-4 md:px-10">
        <div className="flex h-20 items-center justify-between">
          
          {/* LEFT COLUMN (33%) - Navigation (Hidden on Mobile) */}
          <nav className="flex-1 hidden lg:flex items-center gap-8">
            <Link href="/inventory" className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 transition-colors">
              Catalog
            </Link>
            <Link href="/dashboard" className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 transition-colors">
              Portal
            </Link>
          </nav>

          {/* Spacer for Mobile Left to keep center column centered */}
          <div className="flex-1 lg:hidden"></div>

          {/* CENTER COLUMN (33%) - Brand Identity */}
          <div className="flex-none text-center px-2">
            <Link href="/" className="group" onClick={closeMobileMenu}>
              <h1 className="text-lg md:text-2xl font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-600 leading-none">
                Catskill
              </h1>
              <p className="text-[7px] md:text-[9px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-zinc-600 font-medium mt-1 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                Architectural Salvage
              </p>
            </Link>
          </div>

          {/* RIGHT COLUMN (33%) - Actions */}
          <div className="flex-1 flex items-center justify-end gap-1 md:gap-4">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if(isMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              className={`p-2 cursor-pointer transition-colors relative z-50 ${isSearchOpen ? 'text-blue-600' : 'text-zinc-600 hover:text-zinc-800'}`}
            >
              {isSearchOpen ? <X size={18} strokeWidth={2} /> : <Search size={18} strokeWidth={1.5} />}
            </button>
            
            <button 
              className="lg:hidden p-2 text-zinc-500 cursor-pointer"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if(isSearchOpen) setIsSearchOpen(false);
              }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      <div 
        className={`absolute top-full left-0 w-full bg-white border-b border-zinc-200 transition-all duration-300 ease-in-out overflow-hidden shadow-xl z-50 ${
          isSearchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSearch} className="px-6 md:px-10 py-6 max-w-7xl mx-auto flex items-center gap-4 md:gap-6">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="SEARCH ARTIFACTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-800 placeholder:text-zinc-300"
          />
          <button 
            type="submit"
            className="hidden md:block text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-zinc-900 transition-colors shrink-0"
          >
            Execute Search
          </button>
        </form>
      </div>

      {/* MOBILE NAV OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-[#F9F8F6] z-50 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-8">
            <Link 
              href="/inventory" 
              className="text-4xl font-bold uppercase tracking-tighter text-zinc-600 italic border-b border-zinc-200 pb-4"
              onClick={closeMobileMenu}
            >
              Catalog
            </Link>
            <Link 
              href="/dashboard" 
              className="text-4xl font-bold uppercase tracking-tighter text-zinc-600 italic border-b border-zinc-200 pb-4"
              onClick={closeMobileMenu}
            >
              Portal
            </Link>
            <Link 
              href="/about" 
              className="text-4xl font-bold uppercase tracking-tighter text-zinc-600 italic border-b border-zinc-200 pb-4"
              onClick={closeMobileMenu}
            >
              About the Shop
            </Link>
          </nav>
          
          <div className="mt-auto pb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
              © 2026 Catskill Architectural Salvage
            </p>
          </div>
        </div>
      )}
    </header>
  );
}