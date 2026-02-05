import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact | Catskill Architectural Salvage",
  description: "Inquire about specific architectural artifacts or visit our Hudson Valley yard.",
  openGraph: {
    title: "Inquire | Catskill Architectural Salvage",
    description: "Sourcing 19th-century architectural relics in the Hudson Valley.",
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
