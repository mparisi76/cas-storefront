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
} from "@dnd-kit/sortable";
import { GalleryItem } from "@/types/artifact";
import { DirectusFile } from "@directus/sdk";
import { SortablePhoto } from "./SortablePhoto"; // Import our new file

export default function GalleryEditor({
  initialItems = [],
  onChange,
}: {
  initialItems?: GalleryItem[];
  onChange?: (items: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(
    initialItems.map((item) => item.directus_files_id),
  );
  const [isUploading, setIsUploading] = useState(false);

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
    const newItems = items.filter((i) => i !== idToRemove);
    
    // If the user deleted the primary and there's a backup,
    // we could log it or trigger a specific UI state.
    if (items[0] === idToRemove && newItems.length > 0) {
      console.log("Primary photo deleted. Promoting:", newItems[0]);
    }
    
    updateItems(newItems);
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

          {/* New Industrial Upload Slot */}
          <div
            className={`relative aspect-4/5 w-32 border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
              isUploading
                ? "border-zinc-400 bg-zinc-100"
                : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-400"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              disabled={isUploading}
            />
            <div className="text-center space-y-2 px-2">
              <span
                className={`block text-[10px] font-black uppercase tracking-widest ${isUploading ? "text-zinc-900 animate-pulse" : "text-zinc-400"}`}
              >
                {isUploading ? "Syncing..." : "+ Add"}
              </span>
              {isUploading && (
                <div className="w-16 h-1 bg-zinc-200 mx-auto rounded-full overflow-hidden relative">
                  <div
                    className="absolute inset-0 bg-zinc-900 animate-loading-shimmer"
                    style={{ width: "100%", transformOrigin: "left" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DndContext>

      <input
        type="hidden"
        name="ordered_gallery"
        value={JSON.stringify(items)}
      />
      <input type="hidden" name="thumbnail" value={items[0] || ""} />
    </div>
  );
}
