"use client";

interface StatCardButtonProps {
  label: string;
  value: string | number;
  filterValue: string | null;
  isActive: boolean;
  onClick: (status: string | null) => void;
}

export function StatCardButton({ 
  label, 
  value, 
  filterValue, 
  isActive, 
  onClick 
}: StatCardButtonProps) {
  return (
    <button
      onClick={() => onClick(filterValue)}
      className={`text-left p-8 border transition-all duration-300 group ${
        isActive 
          ? "bg-zinc-900 border-zinc-900 shadow-lg" 
          : "bg-white border-zinc-200 hover:border-zinc-400 shadow-sm"
      }`}
    >
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${
        isActive ? "text-zinc-400" : "text-zinc-500 group-hover:text-zinc-900"
      }`}>
        {label}
      </p>
      <p className={`text-3xl font-light tracking-tighter transition-colors ${
        isActive ? "text-white" : "text-zinc-900"
      }`}>
        {value}
      </p>
      {isActive && (
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-2 block">
          Click to clear filter
        </span>
      )}
    </button>
  );
}