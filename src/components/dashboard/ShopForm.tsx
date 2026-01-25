"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

interface ShopData {
  name: string;
  location: string;
  website: string;
}

export function ShopForm({ initialData }: { initialData: ShopData }) {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Logic for saving to a 'global' collection in Directus would go here
    setTimeout(() => {
      showToast("Shop information updated");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSave} className="md:col-span-2 space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Shop Name</label>
          <input 
            type="text" 
            defaultValue={initialData.name}
            className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Primary Location</label>
            <input 
              type="text" 
              defaultValue={initialData.location}
              className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Website</label>
            <input 
              type="url" 
              defaultValue={initialData.website}
              className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:border-zinc-900" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-zinc-100">
        <button 
          disabled={isSaving}
          className="px-8 py-3 bg-white border border-zinc-900 text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
        >
          {isSaving ? "Updating Shop..." : "Update Shop Info"}
        </button>
      </div>
    </form>
  );
}