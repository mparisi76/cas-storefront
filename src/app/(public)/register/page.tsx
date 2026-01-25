// src/app/(public)/register/page.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth/register";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <main className="min-h-[90dvh] flex items-center justify-center bg-[#F9F8F6] px-6 py-12">
      <div className="w-full max-w-md bg-white border border-zinc-200 p-10 md:p-14 shadow-sm">
        
        <header className="mb-10 text-center">
          <h1 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-900 mb-2">
            Vendor Application
          </h1>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest leading-relaxed">
            Join the collective of Catskill <br/> architectural scouts.
          </p>
        </header>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-100 p-3 text-center mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">{state.error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">First Name</label>
              <input name="firstName" type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-800 text-sm bg-transparent" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Name</label>
              <input name="lastName" type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-800 text-sm bg-transparent" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
            <input name="email" type="email" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-800 text-sm bg-transparent" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Create Password</label>
            <input name="password" type="password" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-zinc-800 text-sm bg-transparent" />
          </div>

          <div className="pt-6">
            <button 
              disabled={isPending}
              type="submit"
              className="w-full bg-zinc-900 text-white py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Apply as Vendor"}
            </button>
          </div>

          <div className="text-center pt-4">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
              Already registered? Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}