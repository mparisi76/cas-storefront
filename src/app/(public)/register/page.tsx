import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Vendor Application | Catskill Architectural Salvage",
  description:
    "Apply to join our collective of architectural scouts and curators. List your salvage and 19th-century artifacts in our curated marketplace.",
  openGraph: {
    title: "Partner with the Yard | Vendor Application",
    description:
      "Join the network of Catskill architectural curators and craftsmen.",
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
