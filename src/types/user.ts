// app/(dashboard)/dashboard/settings/page.tsx

export interface DirectusUser {
  first_name: string | null;
  last_name: string | null;
  email: string;
  description: string | null;
  // Add these specific fields here:
  shop_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  role: {
    name: string;
  } | null;
}