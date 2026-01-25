// app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createDirectus, rest, passwordReset } from "@directus/sdk";
import { useToast } from "@/context/ToastContext";

// 1. Move the logic into a sub-component
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return showToast("Invalid or expired token");

    setLoading(true);
    try {
      const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(rest());
      await client.request(passwordReset(token, password));
      
      showToast("Password updated successfully");
      router.push("/login");
    } catch {
      showToast("Link expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-20 text-center uppercase tracking-widest text-[10px] font-black text-zinc-400">
        Invalid or Missing Reset Token
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-black uppercase tracking-[0.2em]">New Password</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
          Enter a secure password for your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">New Password</label>
          <input 
            required
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none" 
          />
        </div>

        <button 
          disabled={loading || password.length < 8}
          className="w-full py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}

// 2. The main page component wraps the form in Suspense
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <Suspense fallback={
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Loading Security Protocol...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}