// src/app/(auth)/artifact/edit/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import EditArtifactForm from "./EditArtifactForm";
import Link from "next/link";
import directus from "@/lib/directus";
import { readItem } from "@directus/sdk";
import { Artifact } from "@/types/product";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) redirect("/login");

  // 1. Fetch data outside of the return statement
  // We use the SDK to get the nested directus_files_id UUIDs
  const artifact = await directus
    .request<Artifact>(
      readItem("props", id, {
        fields: ["*", { photo_gallery: ["directus_files_id"] }],
      }),
    )
    .catch((err) => {
      console.error("Directus Fetch Error:", err);
      return null;
    });

  // 2. Handle the "null" or "error" case immediately
  if (!artifact) {
    notFound();
  }

  // 3. Return JSX at the top level (Fixes the try/catch JSX error)
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/dashboard"
        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors mb-4 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <EditArtifactForm artifact={artifact} id={id} />
    </div>
  );
}
