'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CategoryTree } from '@/types/category';
import { PublicVendor } from "@/services/(public)/vendors";
import { useSearchParams } from 'next/navigation';

export default function MobileFilters({ 
  tree, 
  activeSlug, 
  vendors 
}: { 
  tree: CategoryTree, 
  activeSlug: string,
  vendors: PublicVendor[] 
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const searchParams = useSearchParams();
  
  const activeVendorSlug = searchParams.get('vendor') || 'all';

  const getActiveVendorLabel = () => {
    if (activeVendorSlug === 'all') return "All Shops";
    const vendor = vendors.find(v => v.slug === activeVendorSlug);
    return vendor ? vendor.name : "Shops";
  };

  const getActiveCategoryLabel = () => {
    if (activeSlug === 'all') return "All Categories";
    for (const parentKey in tree) {
      const parent = tree[parentKey];
      if (parent.slug === activeSlug) return parent.name;
      for (const childKey in parent.children) {
        if (parent.children[childKey].slug === activeSlug) return parent.children[childKey].name;
      }
    }
    return "Categories";
  };

  return (
    <div className="lg:hidden sticky top-34.25 z-30 -mx-4 md:-mx-10 w-[calc(100%+2rem)] md:w-[calc(100%+5rem)] flex flex-col">
      
      {/* 1. VENDOR / SHOP SELECTOR */}
      <div className={`relative border-b border-zinc-200 ${isVendorOpen ? 'z-50' : 'z-20'}`}>
        <button 
          onClick={() => {
            setIsVendorOpen(!isVendorOpen);
            setIsCategoryOpen(false);
          }}
          className="w-full flex justify-between items-center bg-[#F9F8F6] px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 transition-colors active:bg-white"
        >
          <span className="truncate">By Shop: {getActiveVendorLabel()}</span>
          <div className="flex items-center gap-2">
            {activeVendorSlug !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
            {isVendorOpen ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isVendorOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-zinc-200 divide-y divide-zinc-100 shadow-xl max-h-[40vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <Link 
              href={`/inventory?${new URLSearchParams({...Object.fromEntries(searchParams), vendor: 'all', page: '1'}).toString()}`}
              onClick={() => setIsVendorOpen(false)} 
              className={`block px-8 py-5 text-[10px] font-bold uppercase tracking-widest ${activeVendorSlug === 'all' ? 'text-blue-600' : 'text-zinc-500'}`}
            >
              All Shops (Global)
            </Link>
            {vendors.map((vendor) => (
              <Link 
                key={vendor.id}
                href={`/inventory?vendor=${vendor.slug}${activeSlug !== 'all' ? `&category=${activeSlug}` : ''}`}
                onClick={() => setIsVendorOpen(false)} 
                className={`block px-8 py-5 text-[10px] font-bold uppercase tracking-widest ${activeVendorSlug === vendor.slug ? 'text-blue-600' : 'text-zinc-500'}`}
              >
                {vendor.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. CATEGORY SELECTOR */}
      <div className={`relative ${isCategoryOpen ? 'z-40' : 'z-10'}`}>
        <button 
          onClick={() => {
            setIsCategoryOpen(!isCategoryOpen);
            setIsVendorOpen(false);
          }}
          className="w-full flex justify-between items-center bg-[#F9F8F6] border-b border-zinc-200 px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 transition-colors active:bg-white"
        >
          <span className="truncate">By Category: {getActiveCategoryLabel()}</span>
          <div className="flex items-center gap-2">
            {activeSlug !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
            {isCategoryOpen ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isCategoryOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-zinc-200 divide-y divide-zinc-100 shadow-xl max-h-[50vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <Link 
              href={`/inventory?${new URLSearchParams({...Object.fromEntries(searchParams), category: 'all', page: '1'}).toString()}`}
              onClick={() => setIsCategoryOpen(false)} 
              className={`block px-8 py-5 text-[10px] font-bold uppercase tracking-widest ${activeSlug === 'all' ? 'text-blue-600' : 'text-zinc-500'}`}
            >
              All Artifacts
            </Link>
            {Object.entries(tree).map(([parentKey, parent]) => (
              <div key={parentKey} className="bg-zinc-50/30">
                <Link 
                  href={`/inventory?category=${parent.slug}${activeVendorSlug !== 'all' ? `&vendor=${activeVendorSlug}` : ''}`} 
                  onClick={() => setIsCategoryOpen(false)} 
                  className={`block px-8 pt-5 pb-2 text-[10px] font-black uppercase tracking-widest ${activeSlug === parent.slug ? 'text-blue-600' : 'text-zinc-800'}`}
                >
                  {parent.name} <span className="text-zinc-400 ml-1">({parent.totalCount})</span>
                </Link>
                <div className="pb-5">
                  {Object.entries(parent.children).map(([childKey, child]) => (
                    <Link 
                      key={childKey} 
                      href={`/inventory?category=${child.slug}${activeVendorSlug !== 'all' ? `&vendor=${activeVendorSlug}` : ''}`} 
                      onClick={() => setIsCategoryOpen(false)} 
                      className={`block px-12 py-2.5 text-[10px] font-bold uppercase tracking-widest ${activeSlug === child.slug ? 'text-blue-600' : 'text-zinc-500'}`}
                    >
                      — {child.name} <span className="opacity-50 ml-1">({child.count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}