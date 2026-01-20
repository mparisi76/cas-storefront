"use client"; // We need this for the scroll listener

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // This forces the window to the top every time the route changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#F9F8F6] text-zinc-700 antialiased">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
