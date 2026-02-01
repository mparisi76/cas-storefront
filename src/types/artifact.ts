export interface Artifact {
  id: string | number;
  name: string;
  price: number;
  thumbnail: string;
  availability?: string;
  status?: string;
  description?: string;
  photo_gallery?: GalleryItem[];
  category: {
    id: string | number;
    name: string;
    slug: string;
    parent: {
      id: string | number;
      name: string;
      slug: string;
    } | null;
  } | null;
  user_created: {
    email: string;
    first_name?: string;
    last_name?: string;
    shop_name?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
  dimensions?: string;
  quantity_available: number;
  condition?: string;
  purchase_price: string;
  classification: string | null;
  weight: string;
  length: string;
  width: string;
  height: string;
  date_created: Date;
  date_updated: Date;
  featured: boolean;
}

export interface GalleryItem {
  directus_files_id: string;
}
