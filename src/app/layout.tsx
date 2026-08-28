import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/app/providers/AppShell";

const siteUrl = "https://catskillas.com";
const siteName = "Catskill Architectural Salvage";
const siteDescription =
  "A regional directory of architectural salvage, antique hardware, and historic building materials from dealers across the Hudson Valley and Catskills.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Hudson Valley & Catskills`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "architectural salvage",
    "antique hardware",
    "salvaged doors",
    "reclaimed wood",
    "barn beams",
    "vintage industrial",
    "Hudson Valley",
    "Catskills",
    "historic preservation",
    "reclaimed building materials",
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
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#F9F8F6] text-zinc-700 antialiased">
        <main className="flex-1">
          <AppShell>{children}</AppShell>
        </main>
      </body>
    </html>
  );
}
