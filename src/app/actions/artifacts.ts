// src/app/actions/artifacts.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createDirectus,
  rest,
  staticToken,
  updateItem,
  createItem,
  deleteItem,
} from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { ArtifactFormState } from "@/types/dashboard";

/**
 * Helper to initialize the Directus Admin Client
 */
// const getAdminClient = () => {
//   const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
//   const token = process.env.DIRECTUS_STATIC_TOKEN;

//   if (!url || !token) {
//     throw new Error("Missing Directus configuration in environment variables.");
//   }

//   return createDirectus(url).with(staticToken(token)).with(rest());
// };

/**
 * Type-safe Error Handler (ESLint Compliant)
 */
const handleActionError = (err: unknown): ArtifactFormState => {
  console.error("ACTION ERROR:", err);

  // 1. Check if the error is a Directus-style object
  if (typeof err === "object" && err !== null) {
    const errorRecord = err as Record<string, unknown>;

    // Handle status codes (e.g., 401)
    if (errorRecord.status === 401) {
      return { error: "AUTH_EXPIRED" };
    }

    // Handle nested Directus error extensions
    if (Array.isArray(errorRecord.errors) && errorRecord.errors.length > 0) {
      const firstError = errorRecord.errors[0] as Record<string, unknown>;
      const extensions = firstError.extensions as
        | Record<string, unknown>
        | undefined;
      const errorCode = extensions?.code;

      if (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN") {
        return { error: "AUTH_EXPIRED" };
      }
    }
  }

  // 2. Handle standard Error objects
  if (err instanceof Error) {
    return { error: err.message };
  }

  // 3. Fallback for everything else
  return { error: "An unexpected server error occurred." };
};

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
        price: parseFloat(priceRaw) || 0,
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
        price: parseFloat(price),
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

export async function deleteArtifactAction(
  id: string,
): Promise<ArtifactFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) return { error: "AUTH_EXPIRED" };

  try {
    // Initialize the User Client to ensure the user can only delete
    // items they have permission to remove.
    const userClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    // Execute deletion as the Vendor
    await userClient.request(deleteItem("props", id));

    revalidatePath("/dashboard");
  } catch (err) {
    return handleActionError(err);
  }

  redirect("/dashboard?success=true&action=delete");
}
