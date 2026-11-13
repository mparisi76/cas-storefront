import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact | Catskill Architectural Salvage",
  description: "Ask about a piece, request something you're hunting for, or arrange a visit in the Hudson Valley.",
  openGraph: {
    title: "Inquire | Catskill Architectural Salvage",
    description: "Antiques, vintage, mid-century, and salvage, sourced across the Hudson Valley.",
    type: "website",
    images: [
      {
        url: "/og-contact.png", // This matches the filename in your public folder
        width: 1200,
        height: 1200,
        alt: "Catskill Architectural Salvage Contact Portal",
      },
    ],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
