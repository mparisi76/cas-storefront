// components/inventory/ShopSkeleton.tsx
export default function ShopSkeleton({
  view,
  count = 12,
}: {
  view: string;
  count?: number;
}) {
  return (
    <div
      className={`${view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"} border-l border-zinc-200 animate-pulse`}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`border-r border-b border-zinc-200 bg-white p-6 flex flex-col h-full relative ${
            view === "grid" ? "min-h-100" : "h-45"
          }`}
        >
          {/* IMAGE CONTAINER SKELETON - Matching aspect-4/5 and mb-6/8 */}
          <div className="aspect-4/5 bg-zinc-100 mb-6 md:mb-8 shrink-0 rounded-sm" />

          {/* TEXT AREA SKELETON */}
          <div className="flex-1 flex flex-col relative min-h-25">
            {/* Vendor Line */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 bg-zinc-100 rounded-full" />
              <div className="h-2.5 bg-zinc-100 w-24 rounded-sm" />
            </div>

            {/* Title & Price Row */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-100 w-full rounded-sm" />
                <div className="h-4 bg-zinc-100 w-2/3 rounded-sm" />
              </div>
              <div className="h-5 bg-zinc-100 w-16 rounded-sm" />
            </div>

            {/* Absolute Serial Badge at bottom-right */}
            <div className="absolute bottom-0 right-0 translate-y-2">
              <div className="h-2.5 bg-zinc-100 w-20 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
