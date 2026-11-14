"use client";

import { useViewer } from "@/lib/client/viewer";

/** Renders its children for everyone except the vendor who owns the item. */
export default function HideFromOwner({ ownerId, children }: { ownerId?: string | null; children: React.ReactNode }) {
  const { isOwner } = useViewer(ownerId);
  return isOwner ? null : <>{children}</>;
}
