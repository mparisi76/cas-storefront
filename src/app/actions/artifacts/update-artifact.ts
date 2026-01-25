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

  // Core Fields - Note: using 'purchase_price' to match your form name change
  const name = formData.get("name") as string;
  const priceRaw = formData.get("purchase_price") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("category") as string;
  const classification = formData.get("classification") as string;
  
  // Gallery Logic
  const orderedGalleryRaw = formData.get("ordered_gallery") as string;
  const finalIdList: string[] = JSON.parse(orderedGalleryRaw || "[]");

  // NEW: Logistics Fields extraction
  const weightRaw = formData.get("weight") as string;
  const lengthRaw = formData.get("length") as string;
  const widthRaw = formData.get("width") as string;
  const heightRaw = formData.get("height") as string;

  try {
    const numericId = parseInt(id, 10);
    const primaryThumbnail = finalIdList.length > 0 ? finalIdList[0] : null;
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
        thumbnail: primaryThumbnail,
        photo_gallery: galleryUpdate,
        classification: classification || null,
        
        // Mapping technical specs to Directus schema
        weight: weightRaw ? parseFloat(weightRaw) : null,
        length: lengthRaw ? parseFloat(lengthRaw) : null,
        width: widthRaw ? parseFloat(widthRaw) : null,
        height: heightRaw ? parseFloat(heightRaw) : null,
      }),
    );

    revalidatePath(`/dashboard/artifact/edit/${id}`);
    revalidatePath("/dashboard");
    revalidatePath("/inventory"); // Ensure public shop shows updated specs
    revalidatePath(`/inventory/${id}`); // Refresh the specific product page
  } catch (err) {
    return handleActionError(err);
  }
  
  redirect("/dashboard?success=true&action=update");
}