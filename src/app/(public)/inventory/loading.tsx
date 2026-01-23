export default function ShopLoading() {
  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-10 px-10">
      <div className="flex gap-16 items-start">
        {/* Sidebar Skeleton */}
        <div className="w-64 sticky top-10 shrink-0 space-y-8">
          <div className="h-4 w-32 bg-zinc-200 animate-pulse" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 w-full bg-zinc-200 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="flex-1">
          {/* Header Skeleton */}
          <div className="mb-12 flex justify-between items-end">
            <div className="space-y-4">
              <div className="h-3 w-40 bg-zinc-200 animate-pulse" />
              <div className="h-10 w-64 bg-zinc-200 animate-pulse" />
            </div>
            <div className="h-6 w-48 bg-zinc-200 animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px border-t border-zinc-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border-r border-b border-zinc-200 p-10">
                {/* Image Placeholder with Shimmer */}
                <div className="aspect-4/5 bg-zinc-100 mb-8 animate-shimmer" />
                
                {/* Text Placeholders */}
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="h-2 w-20 bg-zinc-100 animate-pulse" />
                    <div className="h-4 w-40 bg-zinc-100 animate-pulse" />
                  </div>
                  <div className="h-4 w-12 bg-zinc-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}