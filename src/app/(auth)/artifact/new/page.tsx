// src/app/(auth)/artifact/new/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NewArtifactForm from "./NewArtifactForm";
import Link from "next/link";
import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { Category } from "@/types/category";

export default async function NewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) redirect("/login");

  // Fetch only child categories (where parent is not null)
  const categories = await directus.request<Category[]>(
    readItems("categories", {
      fields: ["id", "name", "slug", { parent: ["id", "name", "slug"] }],
      filter: {
        parent: { _nnull: true }
      },
      // Sort by Parent Name first, then Child Name
      sort: ["parent.name", "name"], 
    })
  ).catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-zinc-100 pb-8">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform duration-200">
            &larr;
          </span>
          <span className="leading-none">Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-light tracking-tighter text-zinc-900 mt-6 italic">
          List New Artifact
        </h1>
      </header>

      <NewArtifactForm categories={categories} />
    </div>
  );
}
