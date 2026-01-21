import NewArtifactForm from "./NewArtifactForm";
import Link from "next/link";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Category } from "@/types/category";

export default async function NewPage() {

  const categories = await directus.request<Category[]>(
    readItems("categories", {
      fields: ["id", "name", "slug", { parent: ["id", "name", "slug"] }],
      sort: ["parent.name", "name"], 
    })
  ).catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-0">
      <Link
        href="/dashboard"
        className="group inline-flex items-center gap-3 mb-2 text-[12px] font-bold uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-900 transition-colors"
      >
        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform duration-200">
          &larr;
        </span>
        <span className="leading-none">Back to Dashboard</span>
      </Link>

      <NewArtifactForm categories={categories} />
    </div>
  );
}
