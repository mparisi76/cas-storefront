"use server";

import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckout(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const price = formData.get("price") as string;
  const itemName = formData.get("itemName") as string;

  const session = await stripe.checkout.sessions.create({
    // ADD THIS HERE - This is what the webhook looks for
    metadata: {
      itemId: itemId, 
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: itemName,
          },
          unit_amount: Math.round(Number(price) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?id=${itemId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/inventory/${itemId}`,
  });

  redirect(session.url!);
}