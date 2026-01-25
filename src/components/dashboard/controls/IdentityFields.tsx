"use client";

interface IdentityFieldsProps {
  name: string;
  price: string;
  onNameChange: (val: string) => void;
  onPriceChange: (val: string) => void;
  maxNameLength?: number;
}

export function IdentityFields({
  name,
  price,
  onNameChange,
  onPriceChange,
  maxNameLength = 60,
}: IdentityFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
            Artifact Name <span className="text-red-500">*</span>
          </label>
          <span
            className={`text-[10px] font-mono ${
              name.length > maxNameLength ? "text-red-500 font-bold" : "text-zinc-400"
            }`}
          >
            {name.length}/{maxNameLength}
          </span>
        </div>
        <input
          name="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. 19th Century Cast Iron Pulley"
          required
          className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-medium placeholder:text-zinc-400 transition-colors"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-800">
          Price (USD) <span className="text-red-500">*</span>
        </label>
        <input
          name="purchase_price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="0.00"
          required
          className="w-full border-b border-zinc-200 py-4 outline-none focus:border-zinc-900 text-lg bg-transparent text-zinc-900 font-mono placeholder:text-zinc-400 transition-colors"
        />
      </div>
    </div>
  );
}