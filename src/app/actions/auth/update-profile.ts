// app/actions/auth/update-profile.ts
"use server";

import { cookies } from "next/headers";
import { createDirectus, rest, staticToken, updateMe } from "@directus/sdk";
import { revalidatePath } from "next/cache";

export type ProfileFormState = {
  success?: boolean;
  error?: string;
};

interface UpdateUserPayload {
  first_name: string;
  last_name: string;
  phone: string;
  shop_name: string;
  city: string;
  state: string;
}

/**
 * Updates the current user's profile in Directus.
 * Handles both standard fields and custom shop-specific fields.
 */
export async function updateProfileAction(
  prevState: ProfileFormState | null,
  formData: FormData,
): Promise<ProfileFormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  // 1. Auth Guard
  if (!token) {
    return { error: "AUTH_EXPIRED" };
  }

  // 2. Extract Data from FormData
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const shopName = formData.get("shop_name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;

  try {
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    /**
     * We use a type cast here because the standard Directus SDK
     * doesn't know about your custom schema fields (shop_name, city, etc.)
     */
    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      // Custom fields injected into the user object
      shop_name: shopName,
      city: city,
      state: state,
    } as UpdateUserPayload;

    await client.request(updateMe(payload));

    // 3. Revalidate the cache
    // Revalidates the settings page to show the new values
    revalidatePath("/dashboard/settings");
    // Revalidates the layout to ensure initials/name in the header update
    revalidatePath("/dashboard");

    return { success: true };
  } catch (e: unknown) {
		// Narrow the error type to access response properties
		const err = e as { response?: { status: number }; errors?: Array<{ extensions: { code: string } }> };
		
		if (err.response?.status === 401) return { error: "SESSION_EXPIRED" };
		return { error: "UPDATE_FAILED" };
	}
}
