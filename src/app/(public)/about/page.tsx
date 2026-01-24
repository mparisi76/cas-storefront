"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 1. Move the logic into a separate small component
function AboutContent() {
  const searchParams = useSearchParams();
  const someParam = searchParams.get("referral");

  return (
    <div>
      <h1>About Us</h1>
      {someParam && <p>Welcome from {someParam}!</p>}
      {/* Rest of your about page content */}
    </div>
  );
}

// 2. The main Page component just renders the Suspense boundary
export default function AboutPage() {
  return (
    <main className="p-8">
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <AboutContent />
      </Suspense>
    </main>
  );
}