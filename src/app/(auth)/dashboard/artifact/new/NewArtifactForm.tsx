"use client";

import { useActionState, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import GalleryWrapper from "@/components/dashboard/GalleryWrapper";
import { CategorySelect } from "@/components/dashboard/controls/CategorySelect";
import { EraClassification } from "@/components/dashboard/controls/EraClassification";
import { TechnicalSpecs } from "@/components/dashboard/controls/TechnicalSpecs";
import { IdentityFields } from "@/components/dashboard/controls/IdentityFields";
import { createArtifactAction } from "@/app/actions/artifacts/create-artifact";
import { Category } from "@/types/category";

export default function NewArtifactForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createArtifactAction, null);

  const [form, setForm] = useState({
    name: "",
    purchase_price: "",
    category: "",
    classification: "vintage",
    description: "",
    weight: "",
    length: "",
    width: "",
    height: ""
  });

  const handleField = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const isFormValid = useMemo(() => (
    form.name.trim().length > 0 && form.purchase_price.trim().length > 0 && form.category !== ""
  ), [form]);

  const formattedCategories = categories.map(cat => ({
    id: String(cat.id),
    name: cat.name,
    parent: cat.parent?.id ? String(cat.parent.id) : null,
  }));

  return (
    <div className="relative">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-1 mb-10">
        <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic">New Artifact</h1>
        <div className="flex items-center gap-3">
          <button form="artifact-form" type="submit" disabled={isPending || !isFormValid} className="bg-zinc-900 px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all disabled:opacity-10">
            {isPending ? "Archiving..." : "Publish"}
          </button>
          <button onClick={() => router.back()} type="button" className="border border-zinc-200 px-5 py-2.5 text-[10px] font-black uppercase text-zinc-500 bg-white">
            Cancel
          </button>
        </div>
      </div>

      <form id="artifact-form" action={formAction} className="space-y-12">
        {state?.error && <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">{state.error}</div>}

        <section className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">Manage photos</label>
          <GalleryWrapper />
        </section>

        <section>
          <EraClassification currentValue={form.classification} onChange={(v) => handleField("classification", v)} />
          <input type="hidden" name="classification" value={form.classification} />
        </section>

        <IdentityFields 
          name={form.name} 
          price={form.purchase_price} 
          onNameChange={(v) => handleField("name", v)} 
          onPriceChange={(v) => handleField("purchase_price", v)} 
        />

        <TechnicalSpecs 
          weight={form.weight} length={form.length} width={form.width} height={form.height} 
          onChange={handleField} 
        />

        <section className="space-y-3 relative">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">Category <span className="text-red-500">*</span></label>
          <input type="hidden" name="category" value={form.category} required />
          <CategorySelect categories={formattedCategories} value={form.category} onChange={(id) => handleField("category", id)} />
        </section>

        <section className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">Description</label>
          <textarea name="description" rows={6} value={form.description} onChange={(e) => handleField("description", e.target.value)} className="w-full border border-zinc-200 p-4 outline-none focus:border-zinc-900 text-base bg-transparent leading-relaxed" />
        </section>

        <div className="pt-8 pb-20 border-t border-zinc-100">
          <button disabled={isPending || !isFormValid} type="submit" className="w-full bg-zinc-900 text-white py-8 text-sm font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-10">
            {isPending ? "Archiving..." : "Publish to Marketplace"}
          </button>
        </div>
      </form>
    </div>
  );
}