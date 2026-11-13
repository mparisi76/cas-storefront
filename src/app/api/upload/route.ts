import { NextResponse } from "next/server";
import { uploadFiles } from "@directus/sdk";
import { getAdminClient } from "@/lib/directus-admin";
import { resolveSession, jsonWithSession } from "@/lib/session-server";

// SVG is deliberately excluded: it can carry embedded script.
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 20;

export async function POST(request: Request) {
  // 1. Only logged-in vendors may upload. This route is deliberately NOT behind
  //    middleware (see middleware.ts), so the session is refreshed here.
  const { token, refreshed } = await resolveSession();
  if (!token) {
    return NextResponse.json(
      { error: "Your session expired. Please log in again." },
      { status: 401 },
    );
  }
  const respond = (body: unknown, init?: ResponseInit) => jsonWithSession(refreshed, body, init);

  // 2. Validate files before anything reaches Directus.
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return respond({ error: "Invalid upload" }, { status: 400 });
  }

  const files = incoming.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0 || files.length > MAX_FILES) {
    return respond(
      { error: `Upload between 1 and ${MAX_FILES} images.` },
      { status: 400 },
    );
  }
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return respond(
        { error: `${file.name}: only JPEG, PNG, WebP, GIF, or AVIF images are allowed.` },
        { status: 415 },
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return respond(
        { error: `${file.name}: images must be under 10 MB.` },
        { status: 413 },
      );
    }
  }

  // 3. Forward only the validated files (drops any extra fields a client sent).
  const outgoing = new FormData();
  files.forEach((file) => outgoing.append("files", file));

  try {
    const result = await getAdminClient().request(uploadFiles(outgoing));

    // Directus only returns created records the token can also READ. With
    // Create-only access the upload succeeds but the response is empty, so
    // we can't tell the editor which file IDs to attach.
    const ids = (Array.isArray(result) ? result : [result])
      .map((f) => (f as { id?: string } | null)?.id)
      .filter((id): id is string => typeof id === "string");

    if (ids.length !== files.length) {
      console.error(
        "Upload: Directus returned no file IDs. Give the service token's policy Read access on directus_files.",
      );
      return respond(
        { error: "Upload reached Directus but no file IDs came back. Check the service account's Read permission on Files." },
        { status: 500 },
      );
    }

    return respond(ids.map((id) => ({ id })));
  } catch (error: unknown) {
    console.error("Upload Error:", error);
    return respond({ error: "Upload failed" }, { status: 500 });
  }
}
