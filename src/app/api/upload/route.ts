import { NextResponse } from 'next/server';
import { createDirectus, rest, staticToken, uploadFiles } from '@directus/sdk';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Create a one-off Admin client specifically for this upload
    // This ensures we are NOT using the "Public" role
    const adminClient = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL as string)
      .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN as string))
      .with(rest());

    const result = await adminClient.request(uploadFiles(formData));
    
    return NextResponse.json(result);
} catch (error: unknown) { // Use unknown here
    console.error("Upload Error:", error);

    // Narrow the type to access the message safely
    const errorMessage = error instanceof Error ? error.message : 'Unauthorized or Upload Failed';

    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}