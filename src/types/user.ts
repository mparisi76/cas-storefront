// app/(dashboard)/dashboard/settings/page.tsx

export interface DirectusUser {
  id?: string;
  avatar?: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  description: string | null;
  // Add these specific fields here:
  shop_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  street_address: string | null;
  zip_code: string | null;
  // Optional separate ship-from address (Directus fields may not exist yet)
  ship_from_street?: string | null;
  ship_from_city?: string | null;
  ship_from_state?: string | null;
  ship_from_zip?: string | null;
  role: {
    name: string;
  } | null;
}