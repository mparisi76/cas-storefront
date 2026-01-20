"use client";

import { useActionState, startTransition } from "react";
import {
  updateArtifactAction,
  deleteArtifactAction,
} from "@/app/actions/artifacts";
import { ArtifactFormState } from "@/types/dashboard";
import { Artifact, GalleryItem } from "@/types/product";
import EditGallery from "@/app/(auth)/artifact/edit/[id]/EditGallery";

export default function EditArtifactForm({
  artifact,
  id,
}: {
  artifact: Artifact;
  id: string;
}) {
  // Merge thumbnail and gallery into a single array for the draggable editor.
  // We ensure the thumbnail is at index 0 so it stays the 'Primary' image.
  const initialGalleryItems: GalleryItem[] = [
    ...(artifact.thumbnail ? [{ directus_files_id: artifact.thumbnail }] : []),
    ...(artifact.photo_gallery || []).filter(
      (item) => item.directus_files_id !== artifact.thumbnail,
    ),
  ];

  const cleanDescription = (artifact.description ?? "").replace(/<[^>]*>/g, '');

  const updateWithId = (state: ArtifactFormState | null, formData: FormData) =>
    updateArtifactAction(id, state, formData);

  const [state, formAction, isPending] = useActionState(updateWithId, null);

  const handleDelete = () => {
    if (confirm("Permanently remove this artifact from the archive?")) {
      startTransition(async () => {
        await deleteArtifactAction(id);
      });
    }
  };

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="flex items-end justify-between border-b border-zinc-100 pb-8 mb-10">
        <h1 className="text-3xl font-light tracking-tighter text-zinc-900 italic">
          Edit Artifact
        </h1>

        <button
          onClick={handleDelete}
          type="button"
          className="border border-zinc-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600/80 hover:text-red-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all bg-white"
        >
          Delete
        </button>
      </div>

      <form action={formAction} className="space-y-10">
        {state?.error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700">
            {state.error}
          </div>
        )}

        {/* Interactive Gallery Section */}
        <div className="space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Manage photos
          </label>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest italic">
            Drag to reorder images. The first image will be set as the Primary
            Thumbnail.
          </p>
          <EditGallery initialItems={initialGalleryItems} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-zinc-50">
          {/* Name */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
              Artifact Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={artifact.name}
              required
              className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-medium"
            />
          </div>

          {/* Price */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
              Price (USD)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={artifact.price}
              required
              className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-mono"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Archive Description
          </label>
          <textarea
            name="description"
            rows={6}
            defaultValue={cleanDescription}
            className="w-full border border-zinc-200 p-4 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 leading-relaxed"
          />
        </div>

        {/* Status / Metadata placeholders could go here */}

        <div>
          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-zinc-900 text-white py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Updating Archive..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
