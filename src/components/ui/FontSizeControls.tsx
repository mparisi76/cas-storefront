"use client";

import { useFontSize } from "@/app/providers/FontSizeProvider";
import { Minus, Plus, Type } from "lucide-react";

export default function FontSizeControls() {
  const { fontSize, setFontSize } = useFontSize();

  const handleIncrement = () => {
    if (fontSize < 3) {
      setFontSize((fontSize + 1) as -1 | 0 | 1 | 2 | 3);
    }
  };

  const handleDecrement = () => {
    if (fontSize > -1) {
      setFontSize((fontSize - 1) as -1 | 0 | 1 | 2 | 3);
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 bg-white border border-zinc-200 px-2 py-1.5 rounded shadow-sm">
        <button 
          onClick={handleDecrement}
          disabled={fontSize === -1}
          className="p-1 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors rounded"
          aria-label="Decrease font size"
        >
          <Minus size={14} className="text-zinc-600" />
        </button>
        
        <div className="flex items-center gap-1.5 px-1 border-x border-zinc-100 min-w-11.25 justify-center">
          <Type size={12} className="text-zinc-400" />
          <span className="text-detail font-black font-mono text-zinc-800">
            {fontSize >= 0 ? `+${fontSize}` : fontSize}
          </span>
        </div>

        <button 
          onClick={handleIncrement}
          disabled={fontSize === 3}
          className="p-1 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors rounded"
          aria-label="Increase font size"
        >
          <Plus size={14} className="text-zinc-600" />
        </button>
      </div>

      {/* SUBTLE GHOST TOOLTIP */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-zinc-50 border border-zinc-200 text-zinc-400 text-detail font-black uppercase tracking-[0.2em] whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-sm">
        Interface Text Scale
      </div>
    </div>
  );
}