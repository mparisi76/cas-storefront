'use client'; // This tells Next.js this component runs in the browser

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-500 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all w-full"
    >
      Print Receipt <Printer className="w-3 h-3" />
    </button>
  );
}