"use client";

import {
  useActionState,
  startTransition,
  useState,
  useMemo,
  useEffect,
} from "react";
import { ArtifactFormState } from "@/types/dashboard";
import GalleryWrapper from "@/components/dashboard/GalleryWrapper";
import { CategorySelect } from "@/components/dashboard/controls/CategorySelect";
import { ConfirmDeleteModal } from "@/components/dashboard/modals/ConfirmDeleteModal";
import { Category } from "@/types/category";
import { useToast } from "@/context/ToastContext";
import { Artifact } from "@/types/artifact";
import { EraClassification } from "@/components/dashboard/controls/EraClassification";
import { TechnicalSpecs } from "@/components/dashboard/controls/TechnicalSpecs";
import { IdentityFields } from "@/components/dashboard/controls/IdentityFields";
import { deleteArtifactAction } from "@/app/actions/artifacts/delete-artifact";
import { updateArtifactAction } from "@/app/actions/artifacts/update-artifact";

// 1. Define specific types to satisfy ESLint and provide type safety
type ArtifactFormData = {
  name: string;
  purchase_price: string;
  description: string;
  category: string;
  classification: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  gallery: string[];
};

export default function EditArtifactForm({
  artifact,
  id,
  categories,
}: {
  artifact: Artifact;
  id: string;
  categories: Category[];
}) {
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Initial Data Normalization ---
  const initialCategoryId =
    typeof artifact.category === "object" && artifact.category !== null
      ? String((artifact.category as Category).id)
      : String(artifact.category ?? "");

  const cleanDescription = (artifact.description ?? "").replace(/<[^>]*>/g, "");

  const initialGalleryIds = useMemo(() => {
    const galleryIds = (artifact.photo_gallery || []).map(
      (g) => g.directus_files_id,
    );
    return artifact.thumbnail
      ? [
          artifact.thumbnail,
          ...galleryIds.filter((fid) => fid !== artifact.thumbnail),
        ]
      : galleryIds;
  }, [artifact]);

  // --- Consolidated Form State ---
  const [form, setForm] = useState<ArtifactFormData>({
    name: artifact.name || "",
    
    // Format to 2 decimal places and remove trailing zeros
    purchase_price: artifact.purchase_price 
      ? parseFloat(String(artifact.purchase_price)).toFixed(2).replace(/\.00$/, '') 
      : "",
      
    description: cleanDescription,
    category: initialCategoryId,
    classification: artifact.classification ?? "vintage",
    weight: String(artifact.weight ?? ""),
    length: String(artifact.length ?? ""),
    width: String(artifact.width ?? ""),
    height: String(artifact.height ?? ""),
    gallery: initialGalleryIds,
  });

  // 2. Updated handleField to avoid 'any'
  const handleField = (field: string, value: string | string[]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- Server Action Setup ---
  const updateWithId = (state: ArtifactFormState | null, formData: FormData) =>
    updateArtifactAction(id, state, formData);

  const [state, formAction, isPending] = useActionState(updateWithId, null);

  useEffect(() => {
    if (state?.success) {
      showToast("Artifact Updated Successfully");
    }
  }, [state?.success, showToast]);

  // --- Dirty Check ---
  const isDirty = useMemo(() => {
    // Parse both to numbers for a true mathematical comparison
    const priceFromForm = parseFloat(form.purchase_price) || 0;
    const priceFromArtifact = parseFloat(String(artifact.purchase_price || 0));

    const basicFieldsChanged =
      form.name !== (artifact.name || "") ||
      priceFromForm !== priceFromArtifact || // Numerical comparison
      form.description !== cleanDescription ||
      form.category !== initialCategoryId ||
      form.classification !== (artifact.classification ?? "vintage") ||
      form.weight !== String(artifact.weight ?? "") ||
      form.length !== String(artifact.length ?? "") ||
      form.width !== String(artifact.width ?? "") ||
      form.height !== String(artifact.height ?? "");

    const galleryChanged =
      JSON.stringify(form.gallery) !== JSON.stringify(initialGalleryIds);

    return basicFieldsChanged || galleryChanged;
  }, [form, artifact, initialCategoryId, cleanDescription, initialGalleryIds]);

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteArtifactAction(id);
      if (result?.error) {
        setIsDeleting(false);
        showToast(
          result.error === "PERMISSION_DENIED"
            ? "Permission Denied"
            : "Error deleting artifact",
        );
      }
    });
  };

  const formattedCategories = categories.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    parent: cat.parent?.id ? String(cat.parent.id) : null,
  }));

  const lastUpdated = artifact.date_updated
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(artifact.date_updated))
    : "No updates recorded";

  const dateCreated = artifact.date_created
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(artifact.date_created))
    : "Unknown";

  return (
    <div className="relative">
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={artifact.name}
        isPending={isDeleting}
      />

      <div className="flex items-center justify-between border-b border-zinc-100 pb-6 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic leading-none">
            Edit Artifact
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="uppercase text-zinc-400">Ref:</span>
              <span className="font-bold text-zinc-600">{id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Catalogued:
              </span>
              <span className="text-[10px] font-medium text-zinc-600">
                {dateCreated}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Modified:
              </span>
              <span className="text-[10px] font-medium text-zinc-600 italic bg-zinc-50 px-1.5 py-0.5 border border-zinc-100">
                {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            form="edit-form"
            type="submit"
            disabled={isPending || !isDirty}
            className="bg-zinc-900 px-8 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all disabled:opacity-20"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            type="button"
            className="border border-zinc-200 px-5 py-2.5 text-[11px] font-black uppercase text-red-600/80 hover:text-red-600 bg-white transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      <form id="edit-form" action={formAction} className="space-y-12">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 p-4 text-[13px] font-bold text-red-700">
            {state.error}
          </div>
        )}

        <section>
          <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800 mb-4">
            Manage photos
          </label>
          <GalleryWrapper
            initialItems={form.gallery.map((fid) => ({
              directus_files_id: fid,
            }))}
            onChange={(newIds) => handleField("gallery", newIds)}
          />
        </section>

        <section>
          <EraClassification
            currentValue={form.classification}
            onChange={(val) => handleField("classification", val)}
          />
          <input
            type="hidden"
            name="classification"
            value={form.classification}
          />
        </section>

        <IdentityFields
          name={form.name}
          price={form.purchase_price}
          onNameChange={(val) => handleField("name", val)}
          onPriceChange={(val) => handleField("purchase_price", val)}
        />

        <TechnicalSpecs
          weight={form.weight}
          length={form.length}
          width={form.width}
          height={form.height}
          onChange={handleField}
        />

        <section className="space-y-3 relative">
          <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
            Category
          </label>
          <input type="hidden" name="category" value={form.category} required />
          <CategorySelect
            categories={formattedCategories}
            value={form.category}
            onChange={(id) => handleField("category", id)}
          />
        </section>

        <section className="space-y-3">
          <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
            Description
          </label>
          <textarea
            name="description"
            rows={8}
            value={form.description}
            onChange={(e) => handleField("description", e.target.value)}
            className="w-full border border-zinc-200 p-6 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 leading-relaxed"
          />
        </section>

        <div className="pt-10 pb-20 border-t border-zinc-100">
          <button
            disabled={isPending || !isDirty}
            type="submit"
            className="w-full bg-zinc-900 text-white py-8 text-[15px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-20"
          >
            {isPending ? "Updating Archive..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
