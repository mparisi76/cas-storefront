"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/layout/StatusPage";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <StatusPage
      code="Something went wrong"
      title="We hit a snag"
      message={
        <>
          This page didn&apos;t load properly. Please try again. If it keeps happening, let us know at{" "}
          <a href="mailto:info@catskillas.com" className="underline hover:text-zinc-900">
            info@catskillas.com
          </a>
          {error.digest ? (
            <span className="block mt-3 text-[11px] font-mono text-zinc-500">Reference: {error.digest}</span>
          ) : null}
        </>
      }
    >
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-colors"
      >
        Try Again
      </button>
    </StatusPage>
  );
}
