"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Artifact } from "@/types/artifact";
import { vendorArtifactService } from "@/services/(vendor)/artifacts";
import { useToast } from "@/context/ToastContext";
import { ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";

interface ArtifactTableProps {
  items: Artifact[];
  token: string;
}

export function ArtifactTable({ items, token }: ArtifactTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Use a local state for the input field to keep typing snappy
  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const currentLimit = Number(searchParams.get("limit") || 20);

  // STABILIZED SEARCH EFFECT
  // We use a ref to track if the search term actually changed to prevent loops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentSearchParam = searchParams.get("search") || "";
      
      // Only push if the input differs from the URL param
      if (inputValue !== currentSearchParam) {
        const params = new URLSearchParams(searchParams.toString());
        if (inputValue) {
          params.set("search", inputValue);
        } else {
          params.delete("search");
        }
        router.push(`?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue, router, searchParams]);

  const handleLoadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(currentLimit + 20));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentSort = searchParams.get("sort") || "";

  const handleSort = (key: string) => {
    const isDesc = currentSort === key;
    const newSort = isDesc ? `-${key}` : key;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const getSortIcon = (key: string) => {
    if (currentSort === key) return <span className="ml-1 text-zinc-900">↑</span>;
    if (currentSort === `-${key}`) return <span className="ml-1 text-zinc-900">↓</span>;
    return <span className="opacity-20 ml-1">↕</span>;
  };

  const hasSelection = selectedIds.length > 0;

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (newStatus: "available" | "sold") => {
    setIsProcessing(true);
    const idsToString = selectedIds.map(id => String(id));
    const result = await vendorArtifactService.bulkUpdateStatus(token, idsToString, newStatus);
    if (result.success) {
      showToast(`Updated ${selectedIds.length} items.`);
      setSelectedIds([]);
      router.refresh();
    }
    setIsProcessing(false);
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    const idsToString = selectedIds.map(id => String(id));
    const result = await vendorArtifactService.bulkDelete(token, idsToString);
    if (result.success) {
      showToast(`${selectedIds.length} items deleted.`);
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
      router.refresh();
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <div className="h-12 relative overflow-hidden bg-white border border-zinc-100 shadow-sm">
        <div className={`absolute inset-0 flex items-center px-4 transition-all duration-500 ${
          hasSelection ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}>
          <svg className="w-3.5 h-3.5 text-zinc-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text"
            placeholder="Filter archive..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[12px] font-medium text-zinc-800 placeholder:text-zinc-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[9px] placeholder:font-black"
          />
          {inputValue && (
            <button onClick={() => setInputValue("")} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">Clear</button>
          )}
        </div>

        <div className={`absolute inset-0 z-50 flex items-center justify-between bg-zinc-900 text-white px-6 h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          hasSelection ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selected</span>
              <span className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">{selectedIds.length}</span>
            </div>
            <div className="h-4 w-px bg-zinc-700" />
            <button onClick={() => setSelectedIds([])} className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Clear Selection</button>
            <div className="h-4 w-px bg-zinc-700" />
            <div className="flex items-center gap-4">
              <button onClick={() => handleBulkStatusUpdate("available")} disabled={isProcessing} className="text-[9px] font-bold uppercase tracking-widest hover:text-green-400 transition-colors disabled:opacity-50">Mark Available</button>
              <button onClick={() => handleBulkStatusUpdate("sold")} disabled={isProcessing} className="text-[9px] font-bold uppercase tracking-widest hover:text-orange-400 transition-colors disabled:opacity-50">Mark Sold</button>
            </div>
          </div>
          <button onClick={() => setIsDeleteModalOpen(true)} disabled={isProcessing} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors disabled:opacity-50">Delete Permanently</button>
        </div>
      </div>

      <div className="border border-zinc-100 shadow-sm bg-white overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="sticky top-0 z-40 bg-zinc-50 px-6 py-4 w-12 border-b border-zinc-200">
                <input type="checkbox" className="accent-zinc-900 cursor-pointer" onChange={toggleSelectAll} checked={selectedIds.length === items.length && items.length > 0} />
              </th>
              <th onClick={() => handleSort('name')} className="sticky top-0 z-40 bg-zinc-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                Artifact Description {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('availability')} className="sticky top-0 z-40 bg-zinc-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                Status {getSortIcon('availability')}
              </th>
              <th onClick={() => handleSort('purchase_price')} className="sticky top-0 z-40 bg-zinc-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right border-b border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                Price {getSortIcon('purchase_price')}
              </th>
              <th className="sticky top-0 z-40 bg-zinc-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right border-b border-zinc-200">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className={`${selectedIds.includes(item.id) ? 'bg-zinc-50' : 'hover:bg-zinc-50/50'} transition-colors cursor-default`} onClick={() => toggleSelect(item.id)}>
                  <td className="px-6 py-6"><input type="checkbox" className="accent-zinc-900 cursor-pointer" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} onClick={(e) => e.stopPropagation()} /></td>
                  <td className="px-6 py-6 text-sm font-medium text-zinc-800">{item.name}</td>
                  <td className="px-6 py-6">
                    <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.availability === "available" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {item.availability}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-sm text-zinc-600 text-right font-mono">${Number(item.purchase_price).toFixed(2)}</td>
                  <td className="px-6 py-6 text-right">
                    <Link href={`/dashboard/artifact/edit/${item.id}`} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors" onClick={(e) => e.stopPropagation()}>Edit</Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">No artifacts found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {items.length >= currentLimit && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/30 flex justify-center">
            <button 
              onClick={handleLoadMore}
              className="px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 transition-all"
            >
              Load More Artifacts
            </button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleBulkDelete} 
        title={selectedIds.length === 1 ? items.find(i => i.id === selectedIds[0])?.name || "Artifact" : `${selectedIds.length} Selected Artifacts`} 
        isPending={isProcessing} 
      />
    </div>
  );
}
