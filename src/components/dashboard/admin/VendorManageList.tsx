"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
  reactivateVendorAction,
  setVendorFeaturedAction,
  suspendVendorAction,
  type VendorActionResult,
} from "@/app/actions/admin/vendors";
import type { AdminVendor } from "@/lib/admin-data";

export function VendorManageList({ vendors }: { vendors: AdminVendor[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmSuspendId, setConfirmSuspendId] = useState<string | null>(null);

  if (vendors.length === 0) {
    return (
      <div className="border border-dashed border-zinc-200 p-8 text-center text-[11px] uppercase tracking-widest text-zinc-500">
        No approved vendors yet.
      </div>
    );
  }

  const run = (id: string, action: () => Promise<VendorActionResult>, successMsg: string) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await action();
      showToast(result.success ? (result.warning ?? successMsg) : result.error);
      if (result.success) router.refresh();
      setBusyId(null);
      setConfirmSuspendId(null);
    });
  };

  const btn =
    "px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] border transition-colors disabled:opacity-50";

  return (
    <ul className="divide-y divide-zinc-100 border border-zinc-100">
      {vendors.map((v) => {
        const name = `${v.first_name ?? ""} ${v.last_name ?? ""}`.trim() || "Unnamed";
        const label = v.shop_name || name;
        const suspended = v.status === "suspended";
        const busy = isPending && busyId === v.id;

        return (
          <li
            key={v.id}
            className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 ${
              suspended ? "bg-zinc-50/60" : ""
            }`}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-900 truncate">{label}</p>
                {v.featured_vendor && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 border border-amber-200 bg-amber-50 px-1.5 py-0.5">
                    Featured
                  </span>
                )}
                {suspended && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 truncate">
                {name} ·{" "}
                <a href={`mailto:${v.email}`} className="underline hover:text-zinc-900">
                  {v.email}
                </a>
              </p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                <Link href={`/inventory?vendor=${v.id}`} className="hover:text-zinc-900">
                  {v.itemCount} {v.itemCount === 1 ? "listing" : "listings"}
                </Link>
                {v.inventory_type ? ` · ${v.inventory_type}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!suspended && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      v.id,
                      () => setVendorFeaturedAction(v.id, !v.featured_vendor),
                      v.featured_vendor ? `${label} removed from Featured Shops.` : `${label} is now featured.`,
                    )
                  }
                  className={`${btn} flex items-center gap-1.5 ${
                    v.featured_vendor
                      ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Star size={12} fill={v.featured_vendor ? "currentColor" : "none"} />
                  {v.featured_vendor ? "Unfeature" : "Feature"}
                </button>
              )}

              {suspended ? (
                <button
                  disabled={busy}
                  onClick={() => run(v.id, () => reactivateVendorAction(v.id), `${label} reactivated.`)}
                  className={`${btn} border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700`}
                >
                  {busy ? "Saving..." : "Reactivate"}
                </button>
              ) : confirmSuspendId === v.id ? (
                <>
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(v.id, () => suspendVendorAction(v.id), `${label} suspended. They can no longer log in.`)
                    }
                    className={`${btn} border-red-600 bg-red-600 text-white hover:bg-red-700`}
                  >
                    {busy ? "Suspending..." : "Confirm Suspend"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setConfirmSuspendId(null)}
                    className={`${btn} border-zinc-200 text-zinc-500 hover:text-zinc-900`}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  disabled={busy}
                  onClick={() => setConfirmSuspendId(v.id)}
                  className={`${btn} border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-200`}
                >
                  Suspend
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
