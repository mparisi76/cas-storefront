"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

function ToastHandler() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
			const action = searchParams.get("action");
			if (action === "update") {
      	showToast("Artifact Updated Successfully");
			} else if (action === "create") {
				showToast("Artifact Created Successfully");
			} else if (action === "delete") {
				showToast("Artifact Deleted Successfully");
			}
      
      // Clean up the URL so the toast doesn't re-fire on refresh
      const newPath = window.location.pathname;
      router.replace(newPath);
    }
  }, [searchParams, showToast, router]);

  return null;
}

// Wrap in Suspense because useSearchParams requires it in Next.js 13+ Client Components
export function ToastListener() {
  return (
    <Suspense fallback={null}>
      <ToastHandler />
    </Suspense>
  );
}