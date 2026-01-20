"use client";

import dynamic from "next/dynamic";
import { GalleryItem } from "@/types/product";

const GalleryEditor = dynamic(() => import("./GalleryEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-wrap gap-4 min-h-40 p-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-4/5 w-32 border border-zinc-100 bg-zinc-50/50 animate-pulse" />
      ))}
    </div>
  ),
});

export default function EditGallery({ initialItems }: { initialItems: GalleryItem[] }) {
  return (
    <div className="space-y-6">
      {/* All the logic (Draggable grid + Upload Button) 
          now lives inside GalleryEditor 
      */}
      <GalleryEditor initialItems={initialItems} />
    </div>
  );
}