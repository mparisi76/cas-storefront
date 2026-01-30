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
  // categoryName,
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
      limit: 4,
      fields: [
        "id", "name", "thumbnail", "purchase_price", "availability", "classification",
        { category: ["id", "slug", "name"] },
        { user_created: ["id", "shop_name"] },
      ],
    })
  );

  const relatedItems = response as Artifact[];
  if (relatedItems.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 pt-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">
            Discovery
          </h3>
          <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-800 italic">
            Related Artifacts
          </h2>
        </div>
        
        <Link
          href={`/inventory?category=${categorySlug}`}
          className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-600 pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-all"
        >
          View all
        </Link>
      </div>

      {/* THE "INVENTORY PAGE" GRID LOGIC: 
          -ml-px and -mt-px on both parent and child.
          This ensures the grid stops exactly where the items stop.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 -ml-px -mt-px">
        {relatedItems.map((related) => (
          <div 
            key={related.id} 
            className="border-t border-r border-b border-l border-zinc-200 bg-[#F9F8F6] -ml-px -mt-px overflow-hidden"
          >
            <ArtifactCard item={related} />
          </div>
        ))}
      </div>
    </section>
  );
}