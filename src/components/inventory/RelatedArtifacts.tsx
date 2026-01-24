import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import Link from "next/link";
import ArtifactCard from "./ArtifactCard";
import { Artifact } from "@/types/artifact";

interface RelatedArtifactsProps {
  categoryId: string | number;
  categoryName: string;
  categorySlug: string;
  currentId: string | number;
}

export default async function RelatedArtifacts({
  categoryId,
  categoryName,
  categorySlug,
  currentId,
}: RelatedArtifactsProps) {
  const response = await directus.request(
    readItems("props", {
      filter: {
        _and: [
          { category: { id: { _eq: categoryId } } },
          { id: { _neq: currentId } },
          { status: { _eq: "published" } },
        ],
      },
      limit: 3,
      fields: [
        "id",
        "name",
        "thumbnail",
        "purchase_price",
        "availability",
        "classification",
        { category: ["id", "slug", "name"] },
      ],
    })
  );

  const relatedItems = response as Artifact[];

  if (relatedItems.length === 0) return null;

  return (
    <section className="mt-32 pt-16 border-t border-zinc-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div className="space-y-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            Discovery
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter italic text-zinc-800 leading-none">
            Related Artifacts
          </h3>
        </div>
        
        <Link
          href={`/inventory?category=${categorySlug}`}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 transition-all"
        >
          <span className="border-b-2 border-blue-100 group-hover:border-blue-600 pb-1">
            View all {categoryName}
          </span>
          <span className="text-lg leading-none">→</span>
        </Link>
      </div>

      {/* Grid: Removed the gap-px background hack for a cleaner, modern look */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedItems.map((related) => (
          <ArtifactCard key={related.id} item={related} />
        ))}
      </div>
    </section>
  );
}