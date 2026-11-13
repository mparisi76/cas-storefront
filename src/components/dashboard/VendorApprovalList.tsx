"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { approveVendorAction, rejectVendorAction } from "@/app/actions/admin/vendors";
import type { AdminVendor } from "@/lib/admin-data";

interface Props {
  vendors: AdminVendor[];
  mode: "pending" | "rejected";
  emptyMessage: string;
}

export function VendorApprovalList({ vendors, mode, emptyMessage }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);

  if (vendors.length === 0) {
    return (
      <div className="border border-dashed border-zinc-200 p-8 text-center text-[11px] uppercase tracking-widest text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  const run = (id: string, action: typeof approveVendorAction, successMsg: string) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await action(id);
      if (result.success) {
        showToast(result.warning ?? successMsg);
        router.refresh();
      } else {
        showToast(result.error);
      }
      setBusyId(null);
      setConfirmRejectId(null);
    });
  };

  return (
    <ul className="divide-y divide-zinc-100 border border-zinc-100">
      {vendors.map((v) => {
        const name = `${v.first_name ?? ""} ${v.last_name ?? ""}`.trim() || "Unnamed";
        const busy = isPending && busyId === v.id;

        return (
          <li
            key={v.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 ${
              mode === "rejected" ? "opacity-60" : ""
            }`}
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-900 truncate">
                {v.shop_name || name}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {name} ·{" "}
                <a href={`mailto:${v.email}`} className="underline hover:text-zinc-900">
                  {v.email}
                </a>
              </p>
              {v.inventory_type && (
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Inventory: {v.inventory_type}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {mode === "pending" && confirmRejectId === v.id ? (
                <>
                  <button
                    disabled={busy}
                    onClick={() => run(v.id, rejectVendorAction, `${v.shop_name || name} rejected.`)}
                    className="px-4 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? "Rejecting..." : "Confirm Reject"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setConfirmRejectId(null)}
                    className="px-4 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(v.id, approveVendorAction, `${v.shop_name || name} approved. We've emailed them.`)
                    }
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {mode === "pending" ? <Check size={12} /> : <RotateCcw size={12} />}
                    {busy ? "Saving..." : mode === "pending" ? "Approve" : "Approve Instead"}
                  </button>
                  {mode === "pending" && (
                    <button
                      disabled={busy}
                      onClick={() => setConfirmRejectId(v.id)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                    >
                      <X size={12} /> Reject
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
