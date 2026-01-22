// @/actions/deleteArtifact.ts
"use server";

import { createDirectus, rest, staticToken, deleteItem } from "@directus/sdk";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArtifactFormState } from "@/types/dashboard"; 
import { handleActionError } from "../utils";

export async function deleteArtifactAction(
  id: string,
): Promise<ArtifactFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) return { error: "AUTH_EXPIRED" };

  try {
    // 1. Initialize client with the logged-in user's token
    const userClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    // 2. Attempt the deletion
    await userClient.request(deleteItem("props", id));

    // 3. Clear cache for the dashboard
    revalidatePath("/dashboard");
  } catch (err: unknown) {
    // Replaced 'any' with 'unknown' for type safety
    // The handleActionError utility will safely parse this
    return handleActionError(err);
  }

  // 4. Redirect only after successful try block
  redirect("/dashboard?success=true&action=delete");
}