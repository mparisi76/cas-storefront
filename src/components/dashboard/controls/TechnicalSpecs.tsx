"use client";

interface TechnicalSpecsProps {
  weight: string;
  length: string;
  width: string;
  height: string;
  onChange: (field: string, value: string) => void;
  /** Validation message from shippingSpecsError, shown under the fields */
  error?: string | null;
}

export function TechnicalSpecs({ weight, length, width, height, onChange, error }: TechnicalSpecsProps) {
  return (
    <div className="pt-4 space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-100" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 shrink-0">
          Logistics & Specs <span className="text-red-500">*</span>
        </h3>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        {[
          { label: "Weight (LBS)", name: "weight", value: weight },
          { label: "Length (IN)", name: "length", value: length },
          { label: "Width (IN)", name: "width", value: width },
          { label: "Height (IN)", name: "height", value: height },
        ].map((field) => (
          <div key={field.name} className="space-y-3">
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500">
              {field.label}
            </label>
            <input
              name={field.name}
              type="number"
              min="0"
              step="any"
              value={field.value}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder="0"
              className="w-full border-b border-zinc-100 py-3 outline-none focus:border-zinc-900 text-base bg-transparent text-zinc-900 font-mono placeholder:text-zinc-200 transition-colors"
            />
          </div>
        ))}
      </div>
      <p className={`text-[11px] leading-relaxed ${error ? "text-red-600" : "text-zinc-500"}`}>
        {error ??
          "Used to quote shipping at checkout. Items over 100 lbs ship by freight, so only weight is required for them."}
      </p>
    </div>
  );
}