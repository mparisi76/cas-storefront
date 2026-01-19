import { NextResponse } from "next/server";
import { ShippingRate } from "./types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { zipCode, weight, length, width, height } = body;

    // 1. FREIGHT GATEKEEPER
    // Carriers like UPS/USPS usually cap at 150lbs, but for salvage, 
    // anything over 100lbs often needs a custom pallet/freight quote.
    if (Number(weight) > 100) {
      return NextResponse.json({ 
        error: "Freight Required", 
        message: "Items over 100lbs require a custom freight quote for safe transit." 
      });
    }

    const response = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: {
          name: "Catskill Architectural Salvage",
          street1: "123 Main St", 
          city: "Catskill",
          state: "NY",
          zip: "12414", // Updated to Catskill, NY Zip
          country: "US",
        },
        address_to: {
          zip: zipCode,
          country: "US",
        },
        parcels: [
          {
            length: length,
            width: width,
            height: height,
            distance_unit: "in",
            weight: weight,
            mass_unit: "lb",
          },
        ],
        async: false,
      }),
    });

    const data = await response.json();

    // 2. MARKUP CONFIGURATION
    const HANDLING_FLAT_FEE = 5.00; // Covers packing materials
    const MARKUP_PERCENTAGE = 1.15; // 15% buffer for historical item insurance/handling

    if (!data.rates) {
      return NextResponse.json({ error: "No rates found" }, { status: 404 });
    }

    const rates = data.rates
      .map((rate: { 
        provider: string; 
        servicelevel: { name: string }; 
        amount: string; 
        currency: string; 
        estimated_days: number 
      }) => {
        // Apply Markup Logic
        const basePrice = parseFloat(rate.amount);
        const markedUpPrice = (basePrice * MARKUP_PERCENTAGE) + HANDLING_FLAT_FEE;

        return {
          provider: rate.provider,
          service: rate.servicelevel.name,
          price: markedUpPrice.toFixed(2),
          currency: rate.currency,
          estimated_days: rate.estimated_days,
        };
      })
      .sort(
        (a: ShippingRate, b: ShippingRate) =>
          parseFloat(a.price) - parseFloat(b.price)
      );

    return NextResponse.json(rates.slice(0, 3));
  } catch (error) {
    console.error("Shipping API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}