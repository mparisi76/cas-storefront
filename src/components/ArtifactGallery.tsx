/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { GalleryItem } from "@/types/product";
import { AlertCircle, Image as ImageIcon } from "lucide-react";

interface ArtifactGalleryProps {
  thumbnail: string;
  photo_gallery: GalleryItem[];
  name: string;
  isSold: boolean;
}

export default function ArtifactGallery({
  thumbnail,
  photo_gallery,
  name,
  isSold,
}: ArtifactGalleryProps) {
  const uniqueGallery = (photo_gallery || []).filter(
    (item) => item.directus_files_id !== thumbnail,
  );
  const allImages = [{ directus_files_id: thumbnail }, ...uniqueGallery];

  const [activeImage, setActiveImage] = useState(thumbnail);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Logic: Reset states immediately when a new thumbnail is clicked
  const handleImageChange = (newId: string) => {
    if (newId === activeImage) return;
    setIsLoaded(false);
    setIsError(false);
    setActiveImage(newId);
  };

  return (
    <section className="lg:col-span-6 space-y-6">
      <div className="aspect-4/5 bg-zinc-50 relative overflow-hidden border border-zinc-200 shadow-sm">
        {/* SKELETON (z-0) - Only visible if isLoaded is false */}
        {!isLoaded && !isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-0">
            <div className="animate-pulse flex flex-col items-center">
              <ImageIcon
                className="text-zinc-400 mb-2"
                size={32}
                strokeWidth={1}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                Retrieving Artifact
              </span>
            </div>
          </div>
        )}

        {/* THE IMAGE (z-10) */}
        <img
          key={activeImage}
          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${activeImage}?width=1000&quality=80&fit=inside`}
          alt={name}
          onLoad={() => {
            // The browser triggers this when the image is fully ready
            setIsLoaded(true);
          }}
          onError={() => {
            setIsError(true);
            setIsLoaded(true);
          }}
          // Ref callback: This handles the "initial load" cache edge case
          // without needing a separate useEffect.
          ref={(img) => {
            if (img && img.complete && !isLoaded && !isError) {
              setIsLoaded(true);
            }
          }}
          className={`relative z-10 object-contain w-full h-full bg-[#F9F8F6] transition-all duration-500 ease-in-out
            ${isLoaded && !isError ? "opacity-100 scale-100" : "opacity-0 scale-[1.01]"} 
            ${isSold ? "grayscale opacity-60" : "grayscale-0"} 
          `}
        />

        {/* ERROR STATE (z-20) */}
        {isError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-100 p-8 text-center">
            <AlertCircle className="text-zinc-400 mb-3" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Image Unreachable
            </p>
          </div>
        )}

        {/* SOLD STAMP (z-30) */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F9F8F6]/20 backdrop-blur-[2px] z-30 pointer-events-none">
            <div className="border-2 border-zinc-800 px-6 py-2 text-zinc-800 font-black uppercase tracking-[0.4em] -rotate-12 bg-white shadow-xl">
              Sold
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {allImages.map((photo, idx) => (
            <button
              key={photo.directus_files_id}
              onClick={() => handleImageChange(photo.directus_files_id)}
              className={`relative shrink-0 w-20 aspect-4/5 border-2 transition-all bg-white overflow-hidden group ${
                activeImage === photo.directus_files_id
                  ? "border-blue-600 shadow-md ring-1 ring-blue-600"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${photo.directus_files_id}?width=200&quality=60`}
                alt={`${name} view ${idx + 1}`}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  activeImage === photo.directus_files_id
                    ? "grayscale-0"
                    : "grayscale group-hover:grayscale-0"
                }`}
              />
              {activeImage === photo.directus_files_id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
