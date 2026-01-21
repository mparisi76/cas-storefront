// lib/directus-auth.ts
export async function isSessionValid(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Crucial: don't cache the result
    });

    return res.ok;
  } catch {
    return false;
  }
}