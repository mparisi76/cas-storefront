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
    
    // Pull the explicit thumbnail ID from our new GalleryEditor hidden input
    const explicitThumbnail = formData.get("thumbnail") as string;
    const primaryThumbnail = explicitThumbnail || (galleryIds.length > 0 ? galleryIds[0] : null);
    
    const classification = formData.get("classification") as string;
    const priceRaw = formData.get("purchase_price") as string; 
    const categoryId = formData.get("category") as string;
    
    // Logistic Fields
    const weightRaw = formData.get("weight") as string;
    const lengthRaw = formData.get("length") as string;
    const widthRaw = formData.get("width") as string;
    const heightRaw = formData.get("height") as string;

    const photoGalleryPayload = galleryIds.map((id) => ({
      directus_files_id: id,
    }));

    const userClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    await userClient.request(
      createItem("props", {
        name: formData.get("name") as string,
        purchase_price: priceRaw ? parseFloat(priceRaw) : null,
        category: categoryId ? parseInt(categoryId, 10) : null,
        description: formData.get("description") as string,
        availability: "available",
        status: "published",
        thumbnail: primaryThumbnail,
        photo_gallery: photoGalleryPayload,
        classification: classification || "vintage",
        type: "for_sale",
        
        // Logistics
        weight: weightRaw ? parseFloat(weightRaw) : null,
        length: lengthRaw ? parseFloat(lengthRaw) : null,
        width: widthRaw ? parseFloat(widthRaw) : null,
        height: heightRaw ? parseFloat(heightRaw) : null,
      }),
    );

    revalidatePath("/artifacts");
    revalidatePath("/dashboard");
    revalidatePath("/inventory");
  } catch (e) {
    return handleActionError(e);
  }

  redirect("/dashboard?success=true&action=create");
}