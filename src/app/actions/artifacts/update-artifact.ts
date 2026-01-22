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

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("category") as string;
  const orderedGalleryRaw = formData.get("ordered_gallery") as string;
  const finalIdList: string[] = JSON.parse(orderedGalleryRaw || "[]");
  const classification = formData.get("classification") as string;

  try {
    const numericId = parseInt(id, 10);
    const primaryThumbnail = finalIdList.length > 0 ? finalIdList[0] : null;
    const galleryUpdate = finalIdList.map((uuid) => ({
      directus_files_id: uuid,
    }));

    // Initialize the User Client using their session token
    const userClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    // Perform update as the Vendor
    await userClient.request(
      updateItem("props", numericId, {
        name,
        purchase_price: parseFloat(price),
        category: categoryId ? parseInt(categoryId, 10) : null,
        description,
        thumbnail: primaryThumbnail,
        photo_gallery: galleryUpdate,
        classification: classification || null,
      }),
    );

    revalidatePath(`dashboard/artifact/edit/${id}`);
    revalidatePath("/dashboard");
  } catch (err) {
    return handleActionError(err);
  }
  redirect("/dashboard?success=true&action=update");
}
