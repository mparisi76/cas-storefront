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

function SortablePhoto({
  id,
  url,
  isPrimary,
  onRemove,
  onPromote,
}: {
  id: string;
  url: string;
  isPrimary: boolean;
  onRemove: (id: string) => void;
  onPromote: (id: string) => void;
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
      className={`group relative aspect-4/5 w-32 border transition-all duration-200 ${
        isPrimary 
          ? "border-zinc-900 ring-1 ring-zinc-900 shadow-md" 
          : "border-zinc-200 bg-white shadow-sm"
      }`}
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
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {!isPrimary && (
        <button
          type="button"
          onClick={() => onPromote(id)}
          className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white border border-white/40 px-2 py-1.5 hover:bg-white hover:text-zinc-900 transition-colors">
            Set as Primary
          </span>
        </button>
      )}

      {isPrimary && (
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 text-[8px] text-white font-black uppercase tracking-[0.2em] py-1.5 text-center pointer-events-none z-10">
          Primary
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(id)}
        className="absolute -top-2 -right-2 bg-white text-zinc-900 border border-zinc-200 rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 shadow-sm z-20"
      >
        ×
      </button>
    </div>
  );
}

export default function GalleryEditor({
  initialItems = [],
  onChange, // New Prop to notify Parent
}: {
  initialItems?: GalleryItem[];
  onChange?: (items: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(
    initialItems.map((item) => item.directus_files_id),
  );
  const [isUploading, setIsUploading] = useState(false);

  // Centralized state updater
  const updateItems = (newItems: string[]) => {
    setItems(newItems);
    if (onChange) onChange(newItems);
  };

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
      const newIds = Array.isArray(result)
        ? result.map((f: DirectusFile) => f.id)
        : [result.id];

      updateItems([...items, ...newIds]);
    } catch {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      updateItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handlePromote = (idToPromote: string) => {
    const filtered = items.filter((id) => id !== idToPromote);
    updateItems([idToPromote, ...filtered]);
  };

  const handleRemove = (idToRemove: string) => {
    updateItems(items.filter((i) => i !== idToRemove));
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
                onRemove={handleRemove}
                onPromote={handlePromote}
              />
            ))}
          </SortableContext>

          <div className="relative aspect-4/5 w-32 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-400 transition-all cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              disabled={isUploading}
            />
            <div className="text-center space-y-1">
              <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {isUploading ? "Uploading" : "+ Add"}
              </span>
            </div>
          </div>
        </div>
      </DndContext>

      <input type="hidden" name="ordered_gallery" value={JSON.stringify(items)} />
      <input type="hidden" name="thumbnail" value={items[0] || ""} />
    </div>
  );
}