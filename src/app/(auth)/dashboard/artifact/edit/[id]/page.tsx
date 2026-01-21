import { notFound } from "next/navigation";
import EditArtifactForm from "./EditArtifactForm";
import Link from "next/link";
import directus from "@/lib/directus";
import { readItem, readItems } from "@directus/sdk";
import { Artifact } from "@/types/product";
import { Category } from "@/types/category";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch both the Artifact and the Categories list
  // Note: We include 'category.*' to get the nested id for the select defaultValue
  const [artifact, categories] = await Promise.all([
    directus.request<Artifact>(
      readItem("props", id, {
        fields: [
          "*", 
          { photo_gallery: ["directus_files_id"] },
          { category: ["id", "name"] }
        ],
      })
    ).catch(() => null),
    
    // ADD THE TYPE HERE: <Category[]>
    directus.request<Category[]>(
      readItems("categories", {
        fields: ["id", "name", "slug", { parent: ["id", "name", "slug"] }],
        sort: ["parent.name", "name"], 
      })
    ).catch(() => [])
  ]);

  if (!artifact) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-0">
      {/* Visual fix: using the aligned arrow logic from earlier */}
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-3 mb-2 text-[12px] font-bold uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-900 transition-colors"
      >
        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform duration-200">
          &larr;
        </span>
        <span className="leading-none">Back to Dashboard</span>
      </Link>

      <EditArtifactForm artifact={artifact} id={id} categories={categories} />
    </div>
  );
}
