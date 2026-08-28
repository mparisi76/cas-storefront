"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { FontSizeProvider } from "@/app/providers/FontSizeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <FontSizeProvider>
      <ToastProvider>{children}</ToastProvider>
    </FontSizeProvider>
  );
}
