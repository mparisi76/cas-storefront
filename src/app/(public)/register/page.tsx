import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Vendor Application | Catskill Architectural Salvage",
  description:
    "Apply to sell with us. List your antiques, vintage and mid-century pieces, decor, and salvage in our Hudson Valley marketplace.",
  openGraph: {
    title: "Partner with the Yard | Vendor Application",
    description:
      "Join the Hudson Valley's network of antique, vintage, and salvage dealers.",
    images: [
      {
        url: "/og-vendor.png", // The industrial tools image you saved
        width: 1200,
        height: 1200,
        alt: "Partner with the Yard - Vendor Application",
      },
    ],
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
