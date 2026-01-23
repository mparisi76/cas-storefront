export default function ProductDetailLoading() {
  return (
    <main className="bg-[#F9F8F6] min-h-screen pt-12 px-10">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Skeleton */}
        <div className="h-3 w-48 bg-zinc-200 animate-pulse mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Side: Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-4/5 bg-white border border-zinc-200 animate-shimmer" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-white border border-zinc-200 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Side: Content Skeleton */}
          <div className="flex flex-col h-full py-4">
            <div className="space-y-6">
              {/* ID & Title */}
              <div className="space-y-3">
                <div className="h-3 w-24 bg-zinc-200 animate-pulse" />
                <div className="h-10 w-full bg-zinc-200 animate-pulse" />
                <div className="h-10 w-3/4 bg-zinc-200 animate-pulse" />
              </div>

              {/* Price */}
              <div className="h-8 w-32 bg-zinc-200 animate-pulse pt-4" />

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-8 py-10 border-y border-zinc-200 my-10">
                <div className="space-y-2">
                  <div className="h-2 w-16 bg-zinc-200 animate-pulse" />
                  <div className="h-6 w-24 bg-zinc-200 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-16 bg-zinc-200 animate-pulse" />
                  <div className="h-6 w-32 bg-zinc-200 animate-pulse" />
                </div>
              </div>

              {/* Description Blocks */}
              <div className="space-y-4">
                <div className="h-3 w-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-2/3 bg-zinc-200 animate-pulse" />
              </div>

              {/* Button Skeleton */}
              <div className="pt-10">
                <div className="h-14 w-full bg-zinc-300 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}