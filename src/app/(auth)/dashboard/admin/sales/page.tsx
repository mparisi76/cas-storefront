import Link from "next/link";
import { getAdminSession } from "@/lib/admin";
import { listRecentSales, formatUSD, type AdminSale } from "@/lib/admin-data";
import { carrierLabel, trackingUrl } from "@/lib/tracking";

export const dynamic = "force-dynamic";

export default async function AdminSalesPage() {
  const session = await getAdminSession(); // layout already 404s non-admins
  let sales: AdminSale[] = [];
  try {
    sales = session ? await listRecentSales(session.client, 50) : [];
  } catch (err) {
    console.error("Failed to load sales:", err);
    return <p className="text-sm text-red-600">Couldn&apos;t load sales from Directus.</p>;
  }

  if (sales.length === 0) {
    return (
      <div className="border border-dashed border-zinc-200 p-8 text-center text-[11px] uppercase tracking-widest text-zinc-500">
        No sales yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] uppercase tracking-widest text-zinc-500">
        Most recent {sales.length} sales · full order and shipping details are in Stripe
      </p>
      <div className="overflow-x-auto border border-zinc-100">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="text-left font-black px-5 py-3">Date</th>
              <th className="text-left font-black px-5 py-3">Item</th>
              <th className="text-left font-black px-5 py-3">Vendor</th>
              {sales.some((s) => s.shipped !== undefined) && <th className="text-left font-black px-5 py-3">Shipped</th>}
              <th className="text-right font-black px-5 py-3">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-4 text-zinc-500 whitespace-nowrap">
                  {s.date_sold
                    ? new Date(s.date_sold).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-5 py-4">
                  <Link href={`/inventory/${s.id}`} className="hover:underline">
                    {s.name}
                  </Link>
                  <span className="ml-2 text-[10px] text-zinc-500 font-mono">CAS-{String(s.id).padStart(4, "0")}</span>
                </td>
                <td className="px-5 py-4 text-zinc-600">{s.vendor}</td>
                {s.shipped !== undefined && (
                  <td className="px-5 py-4 whitespace-nowrap">
                    {s.shipped ? (
                      (() => {
                        const link = trackingUrl(s.shipped.carrier, s.shipped.number);
                        const label = `${carrierLabel(s.shipped.carrier)}${
                          s.shipped.date
                            ? ` · ${new Date(s.shipped.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : ""
                        }`;
                        return link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
                            {label}
                          </a>
                        ) : (
                          <span className="text-green-700">{label}</span>
                        );
                      })()
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Awaiting</span>
                    )}
                  </td>
                )}
                <td className="px-5 py-4 text-right font-medium whitespace-nowrap">{formatUSD(s.purchase_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
