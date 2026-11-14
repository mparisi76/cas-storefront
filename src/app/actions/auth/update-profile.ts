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
  street_address: string;
  zip_code: string;
  description: string;
  avatar: string | null;
  ship_from_street?: string;
  ship_from_city?: string;
  ship_from_state?: string;
  ship_from_zip?: string;
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
  const state = ((formData.get("state") as string) || "").trim().toUpperCase().slice(0, 2);
  const streetAddress = ((formData.get("street_address") as string) || "").trim().slice(0, 200);
  const zipCode = ((formData.get("zip_code") as string) || "").trim();

  if (zipCode && !/^\d{5}$/.test(zipCode)) {
    return { error: "ZIP code must be 5 digits." };
  }

  // Optional separate ship-from address. Only written when the form offered it
  // (i.e. the Directus fields exist); unticking the box clears it.
  const shipFromSupported = formData.get("ship_from_supported") === "1";
  const shipFromEnabled = formData.get("ship_from_enabled") === "1";
  const shipFrom = {
    ship_from_street: shipFromEnabled ? ((formData.get("ship_from_street") as string) || "").trim().slice(0, 200) : "",
    ship_from_city: shipFromEnabled ? ((formData.get("ship_from_city") as string) || "").trim().slice(0, 100) : "",
    ship_from_state: shipFromEnabled
      ? ((formData.get("ship_from_state") as string) || "").trim().toUpperCase().slice(0, 2)
      : "",
    ship_from_zip: shipFromEnabled ? ((formData.get("ship_from_zip") as string) || "").trim() : "",
  };
  if (shipFromEnabled) {
    if (!shipFrom.ship_from_street || !shipFrom.ship_from_city || !/^[A-Z]{2}$/.test(shipFrom.ship_from_state)) {
      return { error: "Please complete the ship-from street, city, and 2-letter state." };
    }
    if (!/^\d{5}$/.test(shipFrom.ship_from_zip)) {
      return { error: "Ship-from ZIP code must be 5 digits." };
    }
  }

  const description = ((formData.get("description") as string) || "").trim().slice(0, 1500);
  const avatarRaw = ((formData.get("avatar") as string) || "").trim();
  if (avatarRaw && !/^[0-9a-f-]{36}$/i.test(avatarRaw)) {
    return { error: "Invalid logo. Please upload it again." };
  }

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
      street_address: streetAddress,
      zip_code: zipCode,
      description,
      avatar: avatarRaw || null,
      ...(shipFromSupported ? shipFrom : {}),
    } as UpdateUserPayload;

    await client.request(updateMe(payload));

    // 3. Revalidate the cache
    // Revalidates the settings page to show the new values
    revalidatePath("/dashboard/settings");
    // Revalidates the layout to ensure initials/name in the header update
    revalidatePath("/dashboard", "layout"); // header name + logo
    // Public shop page and listings show the shop name, logo, bio, and location.
    revalidatePath("/shop", "layout");
    revalidatePath("/inventory", "layout");

    return { success: true };
  } catch (e: unknown) {
		// Narrow the error type to access response properties
		const err = e as { response?: { status: number }; errors?: Array<{ extensions: { code: string } }> };
		
		if (err.response?.status === 401) return { error: "SESSION_EXPIRED" };
		return { error: "UPDATE_FAILED" };
	}
}
