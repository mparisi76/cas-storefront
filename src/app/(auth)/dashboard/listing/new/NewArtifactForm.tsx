"use client";

import { useActionState, useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import GalleryWrapper from "@/components/dashboard/GalleryWrapper";
import { CategorySelect } from "@/components/dashboard/controls/CategorySelect";
import { EraClassification } from "@/components/dashboard/controls/EraClassification";
import { TechnicalSpecs } from "@/components/dashboard/controls/TechnicalSpecs";
import { IdentityFields } from "@/components/dashboard/controls/IdentityFields";
import { createArtifactAction } from "@/app/actions/artifacts/create-artifact";
import { Category } from "@/types/category";
import { suggestArtifactDetailsAction, type ArtifactSuggestion } from "@/app/actions/artifacts/suggest-details";
import { shippingSpecsError } from "@/lib/shipping-specs";
import { useUnsavedChangesGuard } from "@/components/dashboard/UnsavedChangesGuard";

export default function NewArtifactForm({ categories }: { categories: Category[] }) {
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

  // --- Fill with AI -------------------------------------------------------
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  // Uploaded photo IDs, reported live by the gallery so the AI button can enable/disable.
  const [photoIds, setPhotoIds] = useState<string[]>([]);

  const fillWithAI = async () => {
    setAiError(null);
    setAiNote(null);
    if (photoIds.length === 0) {
      setAiError("Upload at least one photo first, then try again.");
      return;
    }

    setAiLoading(true);
    const result = await suggestArtifactDetailsAction({ photoIds, nameHint: form.name });
    setAiLoading(false);
    if (!result.ok) {
      setAiError(result.error);
      return;
    }

    // Fill empty fields only, so nothing the vendor already typed is overwritten.
    // Era is always set (the form preselects a default).
    const s: ArtifactSuggestion = result.suggestion;
    const num = (n: number) => String(Math.round(n * 10) / 10);
    setForm((p) => ({
      ...p,
      name: p.name.trim() ? p.name : s.name,
      description: p.description.trim() ? p.description : s.description,
      category: p.category || (s.category_id !== null ? String(s.category_id) : ""),
      classification: s.classification,
      weight: p.weight || num(s.weight_lbs),
      length: p.length || num(s.length_in),
      width: p.width || num(s.width_in),
      height: p.height || num(s.height_in),
    }));
    setAiNote(s.verify_notes);
  };

  // Warn before losing work: any typed field, or photos already uploaded.
  const hasUnsavedWork = () => {
    const typed = Object.entries(form).some(([k, v]) => k !== "classification" && String(v).trim() !== "");
    return !isPending && (typed || photoIds.length > 0);
  };
  const { confirmLeave, modal: leaveModal } = useUnsavedChangesGuard(hasUnsavedWork);

  const specsError = shippingSpecsError(form);
  const isFormValid = useMemo(() => (
    form.name.trim().length > 0 && form.purchase_price.trim().length > 0 && form.category !== "" && !specsError
  ), [form, specsError]);

  const formattedCategories = categories.map(cat => ({
    id: String(cat.id),
    name: cat.name,
    parent: cat.parent?.id ? String(cat.parent.id) : null,
  }));

  return (
    <div className="relative">
      {leaveModal}
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-1 mb-10">
        <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic">New Listing</h1>
        <div className="flex items-center gap-3">
          <button form="artifact-form" type="submit" disabled={isPending || !isFormValid} className="bg-zinc-900 px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all disabled:opacity-10">
            {isPending ? "Archiving..." : "Publish"}
          </button>
          <button onClick={() => confirmLeave("back")} type="button" className="border border-zinc-200 px-5 py-2.5 text-[10px] font-black uppercase text-zinc-500 bg-white">
            Cancel
          </button>
        </div>
      </div>

      <form id="artifact-form" action={formAction} className="space-y-12">
        {state?.error && <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">{state.error}</div>}

        <section className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">Manage photos</label>
          <GalleryWrapper onChange={setPhotoIds} />

          {/* Fill with AI */}
          <div className="border border-dashed border-blue-200 bg-blue-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              <strong className="text-zinc-900">Fill with AI:</strong>{" "}
              {photoIds.length === 0
                ? "upload a photo above, then let AI draft the title, description, category, era, and estimated size and weight."
                : "let AI draft the title, description, category, era, and estimated size and weight from your photos. You review everything before publishing."}
            </p>
            <button
              type="button"
              onClick={fillWithAI}
              disabled={aiLoading || photoIds.length === 0}
              title={photoIds.length === 0 ? "Upload at least one photo first" : undefined}
              className="shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-colors disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} />
              {aiLoading ? "Looking at your photos..." : "Fill with AI"}
            </button>
          </div>
          {aiError && <p className="text-sm text-red-600">{aiError}</p>}
          {aiNote && (
            <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-1">
              <p className="font-bold">AI filled the empty fields. Please review them, especially weight and dimensions (estimates from photos).</p>
              <p>{aiNote}</p>
            </div>
          )}
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
          error={specsError}
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