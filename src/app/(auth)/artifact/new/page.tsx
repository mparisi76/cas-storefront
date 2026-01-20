"use client";

import { useActionState } from "react";
import { createArtifactAction } from "@/app/actions/artifacts";
import Link from "next/link";

export default function NewArtifactPage() {
  const [state, formAction, isPending] = useActionState(
    createArtifactAction,
    null,
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-zinc-100 pb-8">
        <Link
          href="/dashboard"
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-light tracking-tighter text-zinc-900 mt-4 italic">
          List New Artifact
        </h1>
      </header>

      <form action={formAction} className="space-y-10">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">
            {state.error}
          </div>
        )}

        {/* Image Upload - High Contrast */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Artifact Photo
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="w-full text-sm text-zinc-600 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-zinc-900 file:text-white hover:file:bg-zinc-700 file:cursor-pointer"
          />
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
            Clear photos of machinery or hardware preferred.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Artifact Name / Description
          </label>
          <input
            name="name"
            type="text"
            placeholder="e.g. 19th Century Cast Iron Pulley"
            required
            className="w-full border-b-2 border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Price */}
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
              className="w-full border-b-2 border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-mono"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            History & Material Details
          </label>
          <textarea
            name="description"
            rows={5}
            placeholder="Describe the provenance, material, and any vegan-verified restoration methods used."
            className="w-full border-2 border-zinc-200 p-4 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 leading-relaxed"
          />
        </div>

        <div className="pt-8 border-t border-zinc-100">
          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-zinc-900 text-white py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-zinc-700 transition-all shadow-xl disabled:opacity-50"
          >
            {isPending ? "Archiving..." : "Publish to Marketplace"}
          </button>
        </div>
      </form>
    </div>
  );
}
