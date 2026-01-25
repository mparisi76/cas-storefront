/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortablePhotoProps {
  id: string;
  url: string;
  isPrimary: boolean;
  onRemove: (id: string) => void;
  onPromote: (id: string) => void;
}

export function SortablePhoto({
  id,
  url,
  isPrimary,
  onRemove,
  onPromote,
}: SortablePhotoProps) {
  const [isConfirming, setIsConfirming] = useState(false);

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
      {/* The Drag Handle / Image Layer */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
      >
        <div className="w-full h-full bg-zinc-50 flex items-center justify-center overflow-hidden">
          <img
            src={url}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* "Set as Primary" Overlay */}
      {!isPrimary && (
        <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10 pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPromote(id);
            }}
            className="text-[8px] font-black uppercase tracking-[0.2em] text-white border border-white/40 px-2 py-1.5 hover:bg-white hover:text-zinc-900 transition-colors pointer-events-auto cursor-pointer"
          >
            Set as Primary
          </button>
        </div>
      )}

      {/* Primary Label */}
      {isPrimary && (
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 text-[8px] text-white font-black uppercase tracking-[0.2em] py-1.5 text-center pointer-events-none z-10">
          Primary
        </div>
      )}

      {/* Destructive Delete Button */}
      <button
        type="button"
        onMouseLeave={() => setIsConfirming(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!isConfirming) {
            setIsConfirming(true);
          } else {
            onRemove(id);
          }
        }}
        className={`absolute -top-2 -right-2 flex items-center justify-center text-[9px] font-black tracking-tighter transition-all z-20 shadow-sm border
          ${
            isConfirming
              ? "bg-red-600 text-white border-red-700 px-2 py-1 h-6 rounded-md -right-3"
              : "bg-white text-zinc-900 border-zinc-200 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100"
          }`}
      >
        {isConfirming ? "CONFIRM DELETE" : "×"}
      </button>
    </div>
  );
}
