import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import Link from "next/link";
import ArtifactCard from "./ArtifactCard";
import { Artifact } from "@/types/artifact";

interface MoreFromVendorProps {
  vendorId: string;
  vendorName: string;
  currentId: string;
}

export default async function MoreFromVendor({
  vendorId,
  vendorName,
  currentId,
}: MoreFromVendorProps) {
  const artifacts = await directus.request(
    readItems("props", {
      filter: {
        _and: [
          { user_created: { _eq: vendorId } },
          { id: { _neq: currentId } },
          { status: { _eq: "published" } },
        ],
      },
      sort: ["-date_created"], // Business Logic: Show their newest stock first
      limit: 4,
      fields: [
        "id",
        "name",
        "thumbnail",
        "purchase_price",
        "availability",
        "classification",
        { user_created: ["id", "shop_name"] },
        { category: ["id", "slug", "name"] },
      ],
    }),
  );

  if (!artifacts || (artifacts as Artifact[]).length === 0) return null;

  return (
    <section className="border-t border-zinc-200 pt-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-detail font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">
            Shop Selection
          </h3>
          <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-800 italic">
            More from {vendorName}
          </h2>
        </div>
        <Link
          href={`/inventory?vendor=${vendorId}`}
          className="text-detail font-black uppercase tracking-widest text-blue-600 border-b border-blue-600 pb-1 hover:text-zinc-900 hover:border-zinc-900 transition-all"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 -ml-px -mt-px">
        {(artifacts as Artifact[]).map((item) => (
          <div 
            key={item.id} 
            className="border border-zinc-200 bg-[#F9F8F6] -ml-px -mt-px overflow-hidden"
          >
            <ArtifactCard item={item} hideVendor />
          </div>
        ))}
      </div>
    </section>
  );
}