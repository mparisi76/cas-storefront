"use client";

import { useActionState, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import GalleryWrapper from "@/components/dashboard/GalleryWrapper";
import { CategorySelect } from "@/components/dashboard/controls/CategorySelect";
import { Category } from "@/types/category";
import { EraClassification } from "@/components/dashboard/controls/EraClassification";
import { createArtifactAction } from "@/app/actions/artifacts/create-artifact";

export default function NewArtifactForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const formId = "new-artifact-form";
  const MAX_NAME_LENGTH = 60;
  
  const [state, formAction, isPending] = useActionState(
    createArtifactAction,
    null,
  );

  // --- Form State ---
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [classification, setClassification] = useState("vintage");
  const [description, setDescription] = useState("");
  
  // Logistics Specs State
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // --- Validation Logic ---
  const isFormValid = useMemo(() => {
    return (
      name.trim().length > 0 && 
      name.length <= MAX_NAME_LENGTH &&
      price.trim().length > 0 && 
      selectedCategoryId !== ""
    );
  }, [name, price, selectedCategoryId]);

  const isPublishDisabled = isPending || !isFormValid;

  // Transform categories for the custom select component
  const formattedCategories = categories.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    parent: cat.parent?.id ? String(cat.parent.id) : null,
  }));

  return (
    <div className="relative">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-1 mb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic">
            New Artifact
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            form={formId}
            type="submit"
            disabled={isPublishDisabled}
            className="bg-zinc-900 px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? "Archiving..." : "Publish"}
          </button>

          <button
            onClick={() => router.back()}
            type="button"
            className="border border-zinc-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all bg-white"
          >
            Cancel
          </button>
        </div>
      </div>

      <form id={formId} action={formAction} className="space-y-12">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">
            {state.error}
          </div>
        )}

        {/* Image Upload Section */}
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Manage photos
          </label>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest italic">
            The first image will be set as the Primary Thumbnail.
          </p>
          <GalleryWrapper />
        </div>

        {/* Era Classification Toggle */}
        <div>
          <EraClassification
            currentValue={classification}
            onChange={(val) => setClassification(val)}
          />
          {/* Ensure the value is sent in the form */}
          <input type="hidden" name="classification" value={classification} />
        </div>

        {/* Identity & Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
                Artifact Name <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] font-mono tracking-tighter ${
                name.length > MAX_NAME_LENGTH ? "text-red-500 font-bold" : "text-zinc-400"
              }`}>
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 19th Century Cast Iron Pulley"
              required
              className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-medium placeholder:text-zinc-400 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
              Price (USD) <span className="text-red-500">*</span>
            </label>
            <input
              name="purchase_price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-mono placeholder:text-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3 relative">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Category <span className="text-red-500">*</span>
          </label>
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

        {/* LOGISTICS & SPECS SECTION */}
        <div className="pt-4 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-100" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 shrink-0">
              Logistics & Specs
            </h3>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Weight (LBS)
              </label>
              <input
                name="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
                className="w-full border-b border-zinc-100 py-3 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 font-mono placeholder:text-zinc-400 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Length (IN)
              </label>
              <input
                name="length"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="0"
                className="w-full border-b border-zinc-100 py-3 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 font-mono placeholder:text-zinc-400 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Width (IN)
              </label>
              <input
                name="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="0"
                className="w-full border-b border-zinc-100 py-3 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 font-mono placeholder:text-zinc-400 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Height (IN)
              </label>
              <input
                name="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0"
                className="w-full border-b border-zinc-100 py-3 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 font-mono placeholder:text-zinc-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Description
          </label>
          <textarea
            name="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the provenance, material, and history..."
            className="w-full border border-zinc-200 p-4 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 leading-relaxed placeholder:text-zinc-400 transition-colors"
          />
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-8 pb-20 border-t border-zinc-100">
          <button
            disabled={isPublishDisabled}
            type="submit"
            className="w-full bg-zinc-900 text-white py-8 text-sm font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed"
          >
            {isPending ? "Archiving..." : "Publish to Marketplace"}
          </button>
        </div>
      </form>
    </div>
  );
}