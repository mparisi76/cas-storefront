// src/app/(public)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import Header from "@/components/inventory/Header";
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
      <Suspense fallback={<div className="h-20 bg-[#F9F8F6] border-b border-zinc-200 w-full" />}>
        <Header />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
