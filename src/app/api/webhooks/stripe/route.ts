import { stripe } from '@/lib/stripe';
import directus from '@/lib/directus';
import { updateItem } from '@directus/sdk';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Import Stripe types

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    // Type-cast the data object to a Checkout Session
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Accessing our custom metadata
    const itemId = session.metadata?.itemId;

    if (itemId) {
      try {
        await directus.request(
          updateItem('props', itemId, {
            availability: 'sold',
						date_sold: new Date().toISOString()
          })
        );
        console.log(`Item ${itemId} marked as sold.`);
      } catch (error) {
        console.error('Directus update failed:', error);
      }
    }
  }

  return new NextResponse('Success', { status: 200 });
}