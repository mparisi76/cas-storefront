"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createDirectus, rest, staticToken, updateItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { ArtifactFormState } from "@/types/dashboard";
import { handleActionError } from "../utils";

export async function updateArtifactAction(
  id: string,
  prevState: ArtifactFormState | null,
  formData: FormData,
): Promise<ArtifactFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;
  if (!token) return { error: "AUTH_EXPIRED" };

  // 1. Core Fields
  const name = formData.get("name") as string;
  const priceRaw = formData.get("purchase_price") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("category") as string;
  const classification = formData.get("classification") as string;
  
  // 2. Gallery Logic (Handling the JSON array from our new GalleryEditor)
  const orderedGalleryRaw = formData.get("ordered_gallery") as string;
  const thumbnailId = formData.get("thumbnail") as string; // From our new hidden input
  const finalIdList: string[] = JSON.parse(orderedGalleryRaw || "[]");

  // 3. Technical Specs
  const weightRaw = formData.get("weight") as string;
  const lengthRaw = formData.get("length") as string;
  const widthRaw = formData.get("width") as string;
  const heightRaw = formData.get("height") as string;

  try {
    const numericId = parseInt(id, 10);
    
    /**
     * NOTE: For Directus Many-to-Many relationships, passing the array 
     * like this typically replaces the entire collection for that item.
     */
    const galleryUpdate = finalIdList.map((uuid) => ({
      directus_files_id: uuid,
    }));

    const userClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    await userClient.request(
      updateItem("props", numericId, {
        name,
        purchase_price: priceRaw ? parseFloat(priceRaw) : null,
        category: categoryId ? parseInt(categoryId, 10) : null,
        description,
        classification: classification || null,
        
        // Use the explicit thumbnail ID sent by the GalleryEditor
        thumbnail: thumbnailId || (finalIdList.length > 0 ? finalIdList[0] : null),
        
        // Update the junction table
        photo_gallery: galleryUpdate,
        
        // Logistics
        weight: weightRaw ? parseFloat(weightRaw) : null,
        length: lengthRaw ? parseFloat(lengthRaw) : null,
        width: widthRaw ? parseFloat(widthRaw) : null,
        height: heightRaw ? parseFloat(heightRaw) : null,
      }),
    );

    // Refresh all relevant cache paths
    revalidatePath(`/dashboard/artifact/edit/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/inventory"); 
    revalidatePath(`/inventory/${id}`); 
  } catch (err) {
    return handleActionError(err);
  }
  
  // Success redirect
  redirect("/dashboard?success=true&action=update");
}