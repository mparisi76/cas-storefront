// components/dashboard/forms/EraClassification.tsx
import React from "react";

interface EraClassificationProps {
  currentValue: string; // Made required to ensure sync with form state
  onChange: (value: string) => void;
}

export function EraClassification({
  currentValue,
  onChange,
}: EraClassificationProps) {
  const options = [
    { value: "antique", label: "Antique", sub: "100+ Years" },
    { value: "vintage", label: "Vintage", sub: "20-100 Years" },
    { value: "modern", label: "Modern", sub: "Contemporary" },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800">
        Era Classification
      </label>

      {/* Hidden input to ensure the value is still sent via native FormAction */}
      <input type="hidden" name="classification" value={currentValue} />

      <div className="grid grid-cols-3 gap-1 mt-3 bg-zinc-100 p-1 border border-zinc-200">
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;

          return (
            <button
              key={opt.value}
              type="button" // Important: prevents form submission
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center justify-center py-3 transition-all duration-200 ${
                isSelected
                  ? "bg-white shadow-sm"
                  : "bg-transparent hover:bg-zinc-200/50"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isSelected ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {opt.label}
              </span>
              <span
                className={`text-[8px] uppercase tracking-tighter transition-opacity ${
                  isSelected ? "text-zinc-400 opacity-100" : "opacity-0"
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
