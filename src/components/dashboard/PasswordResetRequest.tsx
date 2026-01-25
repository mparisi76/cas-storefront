// components/dashboard/PasswordResetRequest.tsx
"use client";

import { useState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth/reset-password";
import { useToast } from "@/context/ToastContext";

export function PasswordResetRequest({ email }: { email: string }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    const result = await requestPasswordResetAction(email);

    if (result.success) {
      showToast("Reset link sent to your email");
    } else {
      showToast("Failed to send reset link");
    }
    setLoading(false);
  };

  return (
    <div className="md:col-span-2 space-y-6">
      <div className="bg-zinc-50 border border-zinc-100 p-4">
        <p className="text-[11px] text-zinc-500 italic">
          For security, a password reset link will be dispatched to your
          registered email:
          <span className="text-zinc-900 font-bold ml-1">{email}</span>.
        </p>
      </div>

      {/* Right-justified button container to match ProfileForm */}
      <div className="flex justify-end pt-6 border-t border-zinc-100">
        <button
          onClick={handleRequest}
          disabled={loading}
          className="px-6 py-3 border border-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
        >
          {loading ? "Dispatching..." : "Request Password Reset"}
        </button>
      </div>
    </div>
  );
}
