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
      className={`relative text-left p-8 border transition-colors duration-200 group h-full ${
        isActive 
          ? "bg-zinc-50 border-zinc-900" 
          : "bg-white border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${
        isActive ? "text-zinc-900" : "text-zinc-500"
      }`}>
        {label}
      </p>
      <p className="text-3xl font-light text-zinc-900 tracking-tighter">
        {value}
      </p>
      
      {/* A subtle indicator bar at the bottom instead of growing/shadowing */}
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-900" />
      )}
    </button>
  );
}