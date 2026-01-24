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
import { deleteArtifactAction } from "@/app/actions/artifacts/delete-artifact";
import { updateArtifactAction } from "@/app/actions/artifacts/update-artifact";

export default function EditArtifactForm({
  artifact,
  id,
  categories,
}: {
  artifact: Artifact;
  id: string;
  categories: Category[];
}) {
  const formId = "edit-artifact-form";
  const { showToast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ... (keeping your existing logic for category/description/classification)
  const initialCategoryId =
    typeof artifact.category === "object" && artifact.category !== null
      ? String((artifact.category as Category).id)
      : String(artifact.category ?? "");

  const cleanDescription = (artifact.description ?? "").replace(/<[^>]*>/g, "");
  const initialClassification = artifact.classification ?? "";

  const [name, setName] = useState(artifact.name || "");
  const [price, setPrice] = useState(String(artifact.price || ""));
  const [description, setDescription] = useState(cleanDescription);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(initialCategoryId);
  const [classification, setClassification] = useState(initialClassification);

  const updateWithId = (state: ArtifactFormState | null, formData: FormData) =>
    updateArtifactAction(id, state, formData);

  const [state, formAction, isPending] = useActionState(updateWithId, null);

  useEffect(() => {
    if (state?.success) {
      showToast("Artifact Updated Successfully");
    }
  }, [state?.success, showToast]);

  const isDirty = useMemo(() => {
    return (
      name !== (artifact.name || "") ||
      price !== String(artifact.price || "") ||
      description !== cleanDescription ||
      selectedCategoryId !== initialCategoryId ||
      classification !== initialClassification
    );
  }, [
    name,
    price,
    description,
    selectedCategoryId,
    classification,
    artifact,
    initialCategoryId,
    initialClassification,
    cleanDescription,
  ]);

  // FIXED DELETE HANDLER
  const handleConfirmDelete = () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteArtifactAction(id);

      // Since deleteArtifactAction returns an object with an error key
      if (result?.error) {
        setIsDeleting(false);
        // Map the error code to a readable message
        const message =
          result.error === "PERMISSION_DENIED"
            ? "Permission Denied: You cannot delete this."
            : "Error deleting artifact";

        showToast(message);
      }
      // On success, the redirect inside the action handles the transition
    });
  };

  const formattedCategories = categories.map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    parent: cat.parent?.id ? String(cat.parent.id) : null,
  }));

  const isSaveDisabled = isPending || !isDirty;

  return (
    <div className="relative">
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={artifact.name}
        isPending={isDeleting}
      />

      <div className="flex items-center justify-between border-b border-zinc-100 pb-1 mb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic">
            Edit Artifact
          </h1>
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-medium mt-1">
            Ref: {id.slice(0, 8)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            form={formId}
            type="submit"
            disabled={isSaveDisabled}
            className="bg-zinc-900 px-8 py-2.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all disabled:opacity-20 disabled:grayscale"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            type="button"
            className="border border-zinc-200 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600/80 hover:text-red-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all bg-white"
          >
            Delete
          </button>
        </div>
      </div>

      <form id={formId} action={formAction} className="space-y-10">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 p-4 text-[13px] font-bold text-red-700">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
            Manage photos
          </label>
          <GalleryWrapper
            initialItems={[
              ...(artifact.thumbnail
                ? [{ directus_files_id: artifact.thumbnail }]
                : []),
              ...(artifact.photo_gallery || []).filter(
                (item) => item.directus_files_id !== artifact.thumbnail,
              ),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
              Artifact Name
            </label>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-xl bg-transparent text-zinc-900 font-medium"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
              Price (USD)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-xl bg-transparent text-zinc-900 font-mono"
            />
          </div>
        </div>

        <div>
          <EraClassification
            currentValue={classification}
            onChange={(val) => setClassification(val)}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
            Category
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

        <div className="space-y-3">
          <label className="block text-[13px] font-black uppercase tracking-widest text-zinc-800">
            Description
          </label>
          <textarea
            name="description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-zinc-200 p-6 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 leading-relaxed"
          />
        </div>

        <div className="pt-10 pb-20 border-t border-zinc-100">
          <button
            disabled={isSaveDisabled}
            type="submit"
            className="w-full bg-zinc-900 text-white py-8 text-[15px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
          >
            {isPending ? "Updating Archive..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
