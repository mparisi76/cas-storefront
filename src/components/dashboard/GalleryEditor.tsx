/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GalleryItem } from "@/types/artifact";
import { DirectusFile } from "@directus/sdk";

/**
 * SortablePhoto component handles the individual image cards
 * and their drag-and-drop behavior.
 */
function SortablePhoto({
  id,
  url,
  isPrimary,
  onRemove,
}: {
  id: string;
  url: string;
  isPrimary: boolean;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-4/5 w-32 border bg-white border-zinc-200 shadow-sm transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <div className="w-full h-full bg-zinc-50 flex items-center justify-center overflow-hidden">
          <img
            src={url}
            alt=""
            className="w-full h-full object-contain transition-all duration-300"
          />
        </div>
      </div>
      {isPrimary && (
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 text-[8px] text-white font-black uppercase tracking-widest py-1 text-center pointer-events-none">
          Primary
        </div>
      )}
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="absolute -top-2 -right-2 bg-white text-zinc-900 border border-zinc-200 rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 z-20"
      >
        ×
      </button>
    </div>
  );
}

/**
 * GalleryEditor - Modular component for managing photo galleries
 * Works for both creating new artifacts and editing existing ones.
 */
export default function GalleryEditor({
  initialItems = [], // Default to empty array for "New Artifact" page
}: {
  initialItems?: GalleryItem[];
}) {
  // Initialize state from existing items (if any)
  const [items, setItems] = useState<string[]>(
    initialItems.map((item) => item.directus_files_id),
  );
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();

      // Type-safe extraction of IDs from Directus response
      const newIds = Array.isArray(result)
        ? result.map((f: DirectusFile) => f.id)
        : [result.id];

      setItems((prev) => [...prev, ...newIds]);
    } catch {
      alert("Upload failed. Image might be too large or server is busy.");
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-4 min-h-40 p-1">
          <SortableContext items={items} strategy={rectSortingStrategy}>
            {items.map((id, index) => (
              <SortablePhoto
                key={id}
                id={id}
                url={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${id}?width=300&quality=75`}
                isPrimary={index === 0}
                onRemove={(idToRemove) =>
                  setItems((prev) => prev.filter((i) => i !== idToRemove))
                }
              />
            ))}
          </SortableContext>

          {/* Upload Button */}
          <div className="relative aspect-4/5 w-32 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-100 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isUploading}
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isUploading ? "..." : "+ ADD"}
            </span>
          </div>
        </div>
      </DndContext>

      {/* This hidden input provides the JSON string of IDs to the form action.
          Directus will use this array to sync the junction table.
      */}
      <input
        type="hidden"
        name="ordered_gallery"
        value={JSON.stringify(items)}
      />
    </div>
  );
}
