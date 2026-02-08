"use client";

import React from "react";

interface EraClassificationProps {
  currentValue: string;
  onChange: (value: string) => void;
}

export function EraClassification({
  currentValue,
  onChange,
}: EraClassificationProps) {
  const options = [
    { value: "antique", label: "Antique", sub: "100+ Years" },
    { value: "mid-century", label: "Mid-Century", sub: "1940s–1970s" },
    { value: "vintage", label: "Vintage", sub: "1980s–2000s" },
    { value: "modern", label: "Modern", sub: "Contemporary" },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800">
        Era Classification
      </label>

      {/* Hidden input to ensure the value is still sent via native FormAction */}
      <input type="hidden" name="classification" value={currentValue} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-3 bg-zinc-100 p-1 border border-zinc-200">
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center justify-center py-4 transition-all duration-200 border ${
                isSelected
                  ? "bg-white border-zinc-200 shadow-sm"
                  : "bg-transparent border-transparent hover:bg-zinc-200/50 text-zinc-400"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${
                  isSelected ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {opt.label}
              </span>
              <span
                className={`text-[10px] font-medium uppercase tracking-tighter mt-0.5 transition-opacity ${
                  isSelected ? "text-blue-600 opacity-100" : "opacity-0"
                }`}
              >
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}