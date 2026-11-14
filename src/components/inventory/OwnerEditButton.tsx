"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useViewer } from "@/lib/client/viewer";

/**
 * "Edit listing" on an item page, shown only to the vendor who listed it (or an
 * admin). Item pages are cached for visitors, so login is checked in the browser.
 * Cosmetic only: the edit page and update action enforce permissions themselves.
 */
export default function OwnerEditButton({ itemId, ownerId }: { itemId: string | number; ownerId?: string | null }) {
  const { canEdit, isOwner } = useViewer(ownerId);
  if (!canEdit) return null;

  return (
    <div className="mb-4 space-y-3">
      {isOwner && (
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 text-center">
          This is your listing. Buyers see Purchase and Contact options here.
        </p>
      )}
      <Link
        href={`/dashboard/listing/edit/${itemId}`}
        className="flex w-full items-center justify-center gap-2 border border-zinc-900 bg-white py-3 text-label font-black uppercase tracking-[0.3em] text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
      >
        <Pencil size={14} /> Edit listing
      </Link>
    </div>
  );
}
