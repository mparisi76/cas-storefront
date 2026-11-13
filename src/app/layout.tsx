import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/app/providers/AppShell";

const siteUrl = "https://catskillas.com";
const siteName = "Catskill Architectural Salvage";
const siteDescription =
  "Antiques, vintage, mid-century, and architectural salvage, from furniture, lighting, and decor to hardware and reclaimed building materials, from our own collection and dealers across the Hudson Valley and Catskills.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Hudson Valley & Catskills`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "antiques",
    "vintage furniture",
    "mid-century modern",
    "vintage lighting",
    "vintage decor",
    "architectural salvage",
    "antique hardware",
    "reclaimed building materials",
    "Hudson Valley antiques",
    "Catskills",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} — Hudson Valley & Catskills`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Hudson Valley & Catskills`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Hudson Valley",
      },
      {
        "@type": "AdministrativeArea",
        name: "Catskills",
      },
    ],
    knowsAbout: [
      "Antiques",
      "Vintage furniture",
      "Mid-century modern",
      "Vintage lighting and decor",
      "Architectural salvage",
      "Antique hardware",
      "Reclaimed building materials",
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#F9F8F6] text-zinc-700 antialiased">
        <main className="flex-1">
          <AppShell>{children}</AppShell>
        </main>
      </body>
    </html>
  );
}