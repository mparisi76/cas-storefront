export interface DirectusUser {
  id: string;
  first_name: string;
  last_name: string;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  ship_from_street?: string | null;
  ship_from_city?: string | null;
  ship_from_state?: string | null;
  ship_from_zip?: string | null;
}

export interface StatCardProps {
  label: string;
  value: string | number;
}

export interface AuthResponse {
  error?: string;
  success?: boolean;
}

export interface ArtifactFormState {
  error?: string;
  success?: boolean;
  timestamp?: number;
}

// Define exactly what Directus expects for an update
export interface ArtifactUpdatePayload {
  name: string;
  price: number;
  description: string;
  thumbnail?: string;
  photo_gallery?: string[];
}

export interface DirectusFile {
  id: string;
  [key: string]: unknown; // Other fields we don't care about right now
}
