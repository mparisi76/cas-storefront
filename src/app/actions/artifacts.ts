// src/app/actions/artifacts.ts
"use server";

// import { ArtifactUpdatePayload } from "@/types/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import directus from "@/lib/directus";
import { createDirectus, rest, staticToken, updateItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { ArtifactFormState } from "@/types/dashboard";

// Also, specifically for Server Actions in the latest Next.js versions, 
// you can increase the limit in your next.config.js if the above doesn't catch it:

export async function createArtifactAction(
  prevState: ArtifactFormState | null,
  formData: FormData,
): Promise<ArtifactFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) {
    return { error: "Session expired. Please log in again." };
  }

  try {
    // 1. Parse the Gallery IDs from the hidden input
    const galleryJson = formData.get("ordered_gallery") as string;
    const galleryIds: string[] = galleryJson ? JSON.parse(galleryJson) : [];

    // 2. Set the Thumbnail to the first image in the gallery (the "Primary" one)
    const primaryThumbnail = galleryIds.length > 0 ? galleryIds[0] : null;

    // 3. Prepare the many-to-many payload for the photo_gallery field
    const photoGalleryPayload = galleryIds.map((id) => ({
      directus_files_id: id,
    }));

    // 4. Prepare Payload
    const priceRaw = formData.get("price") as string;
    const payload = {
      name: formData.get("name") as string,
      purchase_price: parseFloat(priceRaw) || 0,
      description: formData.get("description") as string,
      availability: "available",
      status: "published",
      thumbnail: primaryThumbnail, // Automatically uses the first gallery image
      photo_gallery: photoGalleryPayload, // Directus handles the junction table sync
    };

    // 5. Save to Directus (Using the Admin Client if you have one, or fetch)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/props`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      return {
        error: errorData.errors?.[0]?.message || "Database error. Check permissions.",
      };
    }

    // Clear caches so the new artifact shows up immediately
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

  } catch (e) {
    console.error("Artifact Creation Error:", e);
    return { error: "A server error occurred while saving." };
  }

  redirect("/dashboard");
}

// src/app/actions/artifacts.ts

// ... keep your existing interface and createAction ...

// src/app/actions/artifacts.ts

export async function updateArtifactAction(
  id: string,
  prevState: ArtifactFormState | null,
  formData: FormData,
): Promise<ArtifactFormState> {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("category") as string; // Added this

  const orderedGalleryRaw = formData.get("ordered_gallery") as string;
  const finalIdList: string[] = JSON.parse(orderedGalleryRaw || "[]");

  try {
    const numericId = parseInt(id, 10);
    const primaryThumbnail = finalIdList.length > 0 ? finalIdList[0] : null;

    const galleryUpdate = finalIdList.map((uuid) => ({
      directus_files_id: uuid,
    }));

    const adminClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
      .with(rest());

    // IMPORTANT: Ensure "name" in Directus isn't set to a Numeric type
    await adminClient.request(
      updateItem("props", numericId, {
        name: name,
        price: parseFloat(price), // Check if your field is 'price' or 'purchase_price'
        category: categoryId ? parseInt(categoryId, 10) : null, // Added category
        description: description,
        thumbnail: primaryThumbnail,
        photo_gallery: galleryUpdate, 
      })
    );

  } catch (err: unknown) {
    console.error("DIRECTUS UPDATE ERROR:", JSON.stringify(err, null, 2));
    const errorMessage = err instanceof Error ? err.message : "Failed to update artifact";
    return { error: errorMessage };
  }

  revalidatePath(`/artifact/edit/${id}`);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// src/app/actions/artifacts.ts

export async function deleteArtifactAction(
  id: string,
): Promise<ArtifactFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) return { error: "Session expired." };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/props/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) return { error: "Failed to delete artifact." };
  } catch {
    return { error: "An unexpected error occurred." };
  }

  redirect("/dashboard");
}
