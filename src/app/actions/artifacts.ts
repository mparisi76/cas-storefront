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
    // 1. Handle File Upload
    const file = formData.get("image") as File;
    let imageId: string | null = null;

    if (file && file.size > 0) {
      const fileData = new FormData();
      fileData.append("file", file);

      const fileRes = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/files`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fileData,
        },
      );

      if (fileRes.ok) {
        const fileJson = await fileRes.json();
        imageId = fileJson.data.id;
      } else {
        return { error: "Image upload failed. Please try a smaller file." };
      }
    }

    // 2. Prepare Payload
    const priceRaw = formData.get("price") as string;
    const payload = {
      name: formData.get("name") as string,
      price: parseFloat(priceRaw) || 0,
      description: formData.get("description") as string,
      availability: "available",
      status: "published",
      thumbnail: imageId,
    };

    // 3. Save to Directus
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
        error:
          errorData.errors?.[0]?.message ||
          "Database error. Check your permissions.",
      };
    }
  } catch (e) {
    console.error("Artifact Creation Error:", e);
    return { error: "A server error occurred while saving the artifact." };
  }

  // Success path: Redirect back to the dashboard
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

  // 1. Get the IDs from our Client Component. 
  // These already include the new uploads from our /api/upload bridge!
  const orderedGalleryRaw = formData.get("ordered_gallery") as string;
  const finalIdList: string[] = JSON.parse(orderedGalleryRaw || "[]");

  try {
    const numericId = parseInt(id, 10);
    const primaryThumbnail = finalIdList.length > 0 ? finalIdList[0] : null;

    // 2. Prepare the Junction Table data.
    // Note: Don't filter out the primaryThumbnail! 
    // Usually, you want the primary photo to exist in the gallery AND be the thumbnail.
    const galleryUpdate = finalIdList.map((uuid) => ({
      props_id: numericId,
      directus_files_id: uuid,
    }));

		const adminClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
			.with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
			.with(rest());

    await adminClient.request(
      updateItem("props", numericId, {
        name,
        price: parseFloat(price),
        description,
        thumbnail: primaryThumbnail,
        // Directus will sync this junction table: 
        // it deletes old links and adds these new ones in this order.
        photo_gallery: galleryUpdate, 
      })
    );

  } catch (err: unknown) {
    console.error("DIRECTUS UPDATE ERROR:", JSON.stringify(err, null, 2));
    const errorMessage = err instanceof Error ? err.message : "Failed to update artifact";
    return { error: errorMessage };
  }

  // 3. Revalidate and Redirect
  revalidatePath(`/artifact/edit/${id}`);
  revalidatePath(`/artifact/${id}`);
  revalidatePath("/dashboard");
	revalidatePath("/inventory");

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
