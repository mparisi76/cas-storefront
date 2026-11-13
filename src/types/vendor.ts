export interface PublicVendor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  shop_name: string; // The primary display field
  slug: string;
  logo: string | null;
  featured_vendor?: boolean;
  description?: string | null;
  city?: string | null;
  state?: string | null;
}