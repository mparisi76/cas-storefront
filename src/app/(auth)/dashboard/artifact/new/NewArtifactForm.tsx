"use client";

import { useActionState, useState } from "react";
import { createArtifactAction } from "@/app/actions/artifacts";
import GalleryWrapper from "@/components/dashboard/GalleryWrapper";
import { CategorySelect } from "@/components/dashboard/CategorySelect"; // Assuming this is where it lives
import { Category } from "@/types/category";

export default function NewArtifactForm({
  categories,
}: {
  categories: Category[];
}) {
  const [state, formAction, isPending] = useActionState(
    createArtifactAction,
    null,
  );

  // Track the selected category for the custom component
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // We transform your types to match the simple interface of the select
	const formattedCategories = categories.map((cat) => ({
		id: String(cat.id), // Force to string
		name: cat.name,
		parent: cat.parent?.id ? String(cat.parent.id) : null, // Force to string
	}));

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="flex items-end justify-between border-b border-zinc-100 pb-8 mb-10">
        <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic">
          New Artifact
        </h1>
      </div>
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

      {/* NEW Custom Category Dropdown */}
      <div className="space-y-3 relative">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
          Category
        </label>

        {/* Hidden input to pass the value to the server action */}
        <input
          type="hidden"
          name="category"
          value={selectedCategoryId}
          required
        />

        <CategorySelect
          categories={formattedCategories}
          value={selectedCategoryId}
          onChange={(id) => setSelectedCategoryId(id)}
        />
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
  </div>
  );
}
