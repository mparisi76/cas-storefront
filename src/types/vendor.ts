export interface PublicVendor {
  id: string;
  name: string; // Keeping this for backward compatibility if needed
  shop_name: string; // The primary display field
  slug: string;
  logo: string | null;
  featured_vendor?: boolean;
}