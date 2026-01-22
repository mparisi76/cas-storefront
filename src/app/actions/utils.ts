import { ArtifactFormState } from "@/types/dashboard";

export const handleActionError = (err: unknown): ArtifactFormState => {
  console.error("ACTION ERROR:", err);

  if (typeof err === "object" && err !== null) {
    const errorRecord = err as Record<string, unknown>;

    // Handle 401 (Unauthorized)
    if (errorRecord.status === 401) {
      return { error: "AUTH_EXPIRED" };
    }

    // Handle 403 (Forbidden / No Permission)
    if (errorRecord.status === 403) {
      return { error: "PERMISSION_DENIED" };
    }

    if (Array.isArray(errorRecord.errors) && errorRecord.errors.length > 0) {
      const firstError = errorRecord.errors[0] as Record<string, unknown>;
      const extensions = firstError.extensions as
        | Record<string, unknown>
        | undefined;
      const errorCode = extensions?.code;

      if (errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN") {
        return { error: "AUTH_EXPIRED" };
      }

      // Catch Directus Forbidden code
      if (errorCode === "FORBIDDEN") {
        return { error: "PERMISSION_DENIED" };
      }
    }
  }

  // Fallback to ensure the client-side doesn't hang
  return { error: "UNKNOWN_ERROR" };
};
