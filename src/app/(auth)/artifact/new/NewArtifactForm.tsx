// src/app/(auth)/artifact/new/NewArtifactForm.tsx
"use client";

import { useActionState } from "react";
import { createArtifactAction } from "@/app/actions/artifacts";
import GalleryWrapper from "@/components/portal/GalleryWrapper";
import { Category } from "@/types/category";

export default function NewArtifactForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(
    createArtifactAction,
    null,
  );

  // Double-check sorting on the client-side just in case
  const sortedCategories = [...categories].sort((a, b) => {
		// 1. Sort by Parent Name
		const parentA = a.parent?.name || "";
		const parentB = b.parent?.name || "";
		const parentSort = parentA.localeCompare(parentB);
		
		// 2. If parents are the same, sort by Child Name
		if (parentSort !== 0) return parentSort;
		return a.name.localeCompare(b.name);
	});

  return (
    <form action={formAction} className="space-y-10">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">
          {state.error}
        </div>
      )}

      {/* Image Upload */}
      <div className="space-y-4">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
          Manage photos
        </label>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest italic">
          Drag to reorder images. The first image will be set as the Primary
          Thumbnail.
        </p>
        <GalleryWrapper />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-zinc-50">
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Artifact Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="e.g. 19th Century Cast Iron Pulley"
            required
            className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-medium placeholder:text-zinc-300"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Price (USD)
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
            className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-mono placeholder:text-zinc-300"
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-3 relative">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
          Category
        </label>
        <div className="relative border-b border-zinc-200">
          <select
            name="category"
            defaultValue=""
            required
            className="w-full py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-medium appearance-none cursor-pointer pr-8"
          >
            <option value="" disabled className="text-zinc-400">Select a category</option>
            {sortedCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="text-zinc-900">
                {cat.parent?.name ? `${cat.parent.name} — ` : ""}{cat.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
          History & Material Details
        </label>
        <textarea
          name="description"
          rows={6}
          placeholder="Describe the provenance, material, and history..."
          className="w-full border border-zinc-200 p-4 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 leading-relaxed placeholder:text-zinc-300"
        />
      </div>

      <div className="pt-8">
        <button
          disabled={isPending}
          type="submit"
          className="w-full bg-zinc-900 text-white py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Archiving..." : "Publish to Marketplace"}
        </button>
      </div>
    </form>
  );
}