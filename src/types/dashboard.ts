export interface DirectusUser {
  id: string;
  first_name: string;
  last_name: string;
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
