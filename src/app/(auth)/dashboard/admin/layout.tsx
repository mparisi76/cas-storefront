import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getAdminStats, formatUSD, type AdminStats } from "@/lib/admin-data";
import { AdminTabs } from "@/components/dashboard/admin/AdminTabs";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  // Non-admins get a plain 404 rather than learning the section exists.
  if (!session) notFound();

  let stats: AdminStats | null = null;
  try {
    stats = await getAdminStats(session.client);
  } catch (err) {
    console.error("Failed to load admin stats:", err);
  }

  const cards = [
    { label: "Pending Applications", value: stats?.pendingVendors, highlight: !!stats?.pendingVendors },
    { label: "Active Vendors", value: stats?.activeVendors },
    { label: "Items For Sale", value: stats?.itemsForSale },
    {
      label: "Sales · Last 30 Days",
      value: stats ? `${stats.sales30Count} · ${formatUSD(stats.sales30Revenue)}` : undefined,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-0 text-zinc-900">
      <header className="mb-10 border-b border-zinc-100 pb-8">
        <h1 className="text-2xl font-light tracking-tight">Admin Dashboard</h1>
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest mt-2">
          Vendors, approvals, and sales across the marketplace
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`p-6 border ${c.highlight ? "border-blue-600 bg-blue-50/40" : "border-zinc-200 bg-white"}`}
          >
            <p
              className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                c.highlight ? "text-blue-600" : "text-zinc-500"
              }`}
            >
              {c.label}
            </p>
            <p className="text-2xl font-light tracking-tighter">{c.value ?? "—"}</p>
          </div>
        ))}
      </div>

      <AdminTabs pendingCount={stats?.pendingVendors ?? 0} />

      <div className="pt-8 pb-20">{children}</div>
    </div>
  );
}
