// src/app/actions/artifacts.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createDirectus, rest, staticToken, createItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { ArtifactFormState } from "@/types/dashboard";
import { handleActionError } from "../utils";

export async function createArtifactAction(
  prevState: ArtifactFormState | null,
  formData: FormData,
): Promise<ArtifactFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) return { error: "AUTH_EXPIRED" };

  try {
    const galleryJson = formData.get("ordered_gallery") as string;
    const galleryIds: string[] = galleryJson ? JSON.parse(galleryJson) : [];
    const primaryThumbnail = galleryIds.length > 0 ? galleryIds[0] : null;
    const classification = formData.get("classification") as string;
    const priceRaw = formData.get("price") as string;
    const categoryId = formData.get("category") as string;

    const photoGalleryPayload = galleryIds.map((id) => ({
      directus_files_id: id,
    }));

    // --- NEW LOGIC: Use the User's Token ---
    // Create a client specifically for this user's session
    const userClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    await userClient.request(
      createItem("props", {
        name: formData.get("name") as string,
        purchase_price: parseFloat(priceRaw) || 0,
        category: categoryId ? parseInt(categoryId, 10) : null,
        description: formData.get("description") as string,
        availability: "available",
        status: "published",
        thumbnail: primaryThumbnail,
        photo_gallery: photoGalleryPayload,
        classification: classification || "vintage",
        type: "for_sale",
      }),
    );
    // --- END NEW LOGIC ---

    revalidatePath("/artifacts");
    revalidatePath("/dashboard");
  } catch (e) {
    // If the userClient fails, it might be because the Vendor role
    // lacks "Create" permissions. Ensure Vendor has Create access.
    return handleActionError(e);
  }

  redirect("/dashboard?success=true&action=create");
}
