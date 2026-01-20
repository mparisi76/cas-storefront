"use client";

import { useActionState, Suspense } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// 1. Move the logic that uses useSearchParams into this sub-component
function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  return (
    <div className="w-full max-w-sm bg-white border border-zinc-200 p-10 md:p-14 shadow-sm">
      <header className="mb-10 text-center">
        <h1 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-900 mb-2">
          Vendor Login
        </h1>
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
          Access your seller dashboard
        </p>
      </header>

      {/* Success Message after Registration */}
      {isRegistered && (
        <div className="bg-green-50 border border-green-100 p-3 text-center mb-6">
          <p className="text-[9px] font-bold uppercase tracking-widest text-green-700">
            Registration successful. Please login.
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="bg-red-50 border border-red-100 p-3 text-center mb-6">
            <p className="text-[9px] font-bold uppercase tracking-widest text-red-600">
              {state.error}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-800 text-sm bg-transparent text-zinc-800 font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-800 text-sm bg-transparent text-zinc-800 font-medium"
          />
        </div>

        <div className="pt-4 space-y-6">
          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-zinc-900 text-white py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-700 transition-all disabled:opacity-50"
          >
            {isPending ? "Authenticating..." : "Login"}
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              New to the marketplace?
            </p>
            <Link
              href="/register"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 hover:text-zinc-600 underline underline-offset-4"
            >
              Create Vendor Account
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

// 2. The main page component just wraps the form in Suspense
export default function LoginPage() {
  return (
    <main className="min-h-[80dvh] flex items-center justify-center bg-[#F9F8F6] px-6">
      <Suspense
        fallback={
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
