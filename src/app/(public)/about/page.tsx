import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Catskill Architectural Salvage is a regional directory connecting buyers with architectural salvage, antique hardware, and reclaimed building materials from dealers across the Hudson Valley and Catskills.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  return <div className="h-200"></div>;
}
