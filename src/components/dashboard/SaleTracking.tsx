"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck, Pencil } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { markShippedAction } from "@/app/actions/sales/mark-shipped";
import { CARRIERS, carrierLabel, trackingUrl } from "@/lib/tracking";

type Tracking = { carrier: string | null; number: string | null; dateShipped: string | null } | null;

const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

/** Shipping status + "Add tracking" form for one sale on the vendor Sales page. */
export function SaleTracking({ itemId, tracking }: { itemId: number; tracking: Tracking }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(!tracking);
  const [carrier, setCarrier] = useState(tracking?.carrier ?? "usps");
  const [number, setNumber] = useState(tracking?.number ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await markShippedAction(String(itemId), carrier, number);
      if (!result.success) {
        setError(result.error);
        return;
      }
      showToast(result.warning ?? (tracking ? "Tracking updated. The buyer has been emailed." : "Marked as shipped. The buyer has been emailed."));
      setEditing(false);
      router.refresh();
    });
  };

  if (tracking && !editing) {
    const link = trackingUrl(tracking.carrier, tracking.number);
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2 py-1">
          <PackageCheck size={12} /> Shipped {day(tracking.dateShipped)}
        </span>
        <span className="text-zinc-700">
          {carrierLabel(tracking.carrier)}:{" "}
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline">
              {tracking.number}
            </a>
          ) : (
            <span className="font-mono">{tracking.number}</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          <Pencil size={11} /> Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="border border-zinc-200 bg-white px-3 py-2 text-sm"
          aria-label="Carrier"
        >
          {CARRIERS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Tracking number"
          className="flex-1 min-w-0 border border-zinc-200 bg-white px-3 py-2 text-sm font-mono"
          aria-label="Tracking number"
        />
        <button
          type="submit"
          disabled={isPending || !number.trim()}
          className="bg-zinc-900 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : tracking ? "Update tracking" : "Mark as shipped"}
        </button>
        {tracking && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
          >
            Cancel
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-[11px] text-zinc-500">The buyer is emailed the tracking number when you save.</p>
    </form>
  );
}
