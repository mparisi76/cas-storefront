// src/app/(public)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/inventory/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
