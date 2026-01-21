/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { GalleryItem } from "@/types/product";

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
    (item) => item.directus_files_id !== thumbnail
  );

  const allImages = [{ directus_files_id: thumbnail }, ...uniqueGallery];

  const [activeImage, setActiveImage] = useState(thumbnail);
  const [isLoaded, setIsLoaded] = useState(true);
  const nextImage = useRef<string | null>(null);

  const handleImageChange = (newId: string) => {
    if (newId === activeImage) return;
    
    // Start the fade out
    setIsLoaded(false);
    nextImage.current = newId;

    // We change the source. The transition-opacity in the CSS 
    // will handle the smooth disappearance. 
    // When the NEW image loads, the onLoad below will trigger the fade back in.
    setTimeout(() => {
      setActiveImage(newId);
    }, 150); 
  };

  return (
    <section className="lg:col-span-6 space-y-6">
      {/* Main Large Display */}
      <div className="aspect-4/5 bg-white shadow-lg relative overflow-hidden border border-zinc-200">
        <img
          key={activeImage}
          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${activeImage}?width=1000&quality=80&fit=inside`}
          alt={name}
          onLoad={() => setIsLoaded(true)}
          className={`object-contain w-full h-full transition-all duration-500 ease-in-out
            ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.01]"} 
            ${isSold ? "grayscale opacity-60" : "grayscale-0"} 
          `}
        />
        
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F9F8F6]/20 backdrop-blur-[2px] z-10">
            <div className="border-2 border-zinc-800 px-6 py-2 text-zinc-800 font-black uppercase tracking-[0.4em] -rotate-12 bg-white shadow-xl">
              Sold
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((photo, idx) => (
            <button
              key={photo.directus_files_id}
              onClick={() => handleImageChange(photo.directus_files_id)}
              className={`shrink-0 w-20 aspect-4/5 border-2 transition-all bg-white overflow-hidden ${
                activeImage === photo.directus_files_id
                  ? "border-zinc-800 shadow-md"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${photo.directus_files_id}?width=200&quality=60`}
                alt={`${name} view ${idx + 1}`}
                className={`w-full h-full object-cover transition-all ${
                    activeImage === photo.directus_files_id ? "grayscale-0" : "grayscale hover:grayscale-0"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}