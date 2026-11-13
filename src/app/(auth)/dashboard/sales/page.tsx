import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Truck, Mail, Phone, MapPin, Package } from "lucide-react";
import { ACCESS_COOKIE } from "@/lib/session";
import { getVendorSales, type VendorSale } from "@/lib/vendor-sales";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sales" };

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const ref = (id: number) => `CAS-${String(id).padStart(4, "0")}`;

export default async function SalesPage() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");

  let sales: VendorSale[] = [];
  let loadError = false;
  try {
    sales = await getVendorSales(token);
  } catch (err) {
    console.error("Failed to load vendor sales:", err);
    loadError = true;
  }

  const since30 = Date.now() - 30 * 24 * 3600 * 1000;
  const revenue = sales.reduce((sum, s) => sum + s.itemPrice, 0);
  const last30 = sales.filter((s) => s.dateSold && Date.parse(s.dateSold) >= since30);
  const revenue30 = last30.reduce((sum, s) => sum + s.itemPrice, 0);

  const cards = [
    { label: "Pieces Sold", value: String(sales.length) },
    { label: "Total Sales", value: usd(revenue) },
    { label: "Last 30 Days", value: `${last30.length} · ${usd(revenue30)}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-0 text-zinc-900">
      <header className="mb-10 border-b border-zinc-100 pb-8">
        <h1 className="text-2xl font-light tracking-tight">Sales</h1>
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest mt-2">
          Everything you&apos;ve sold, with who to ship it to
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="p-6 border border-zinc-200 bg-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{c.label}</p>
            <p className="text-2xl font-light tracking-tighter">{c.value}</p>
          </div>
        ))}
      </div>

      {loadError ? (
        <p className="text-sm text-red-600">Couldn&apos;t load your sales right now. Please refresh to try again.</p>
      ) : sales.length === 0 ? (
        <div className="border border-dashed border-zinc-200 p-12 text-center">
          <Package size={24} className="mx-auto text-zinc-400 mb-3" />
          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">No sales yet</p>
          <p className="mt-2 text-sm text-zinc-500">
            When something sells, it shows up here and we email you the shipping details.
          </p>
        </div>
      ) : (
        <ul className="space-y-4 pb-20">
          {sales.map((s) => (
            <li key={s.id} className="border border-zinc-200 bg-white">
              {/* Summary row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-b border-zinc-100">
                <div className="min-w-0">
                  <Link href={`/inventory/${s.id}`} className="text-sm font-bold text-zinc-900 hover:underline">
                    {s.name}
                  </Link>
                  <span className="ml-2 text-[10px] font-mono text-zinc-500">{ref(s.id)}</span>
                </div>
                <div className="flex items-center gap-6 text-sm shrink-0">
                  <span className="text-zinc-500">Sold {day(s.dateSold)}</span>
                  <span className="font-bold">{usd(s.itemPrice)}</span>
                </div>
              </div>

              {/* Fulfillment details */}
              {s.order ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 py-5 text-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5">
                      <Truck size={12} /> Shipping
                    </p>
                    {s.order.shipping ? (
                      <p className="text-zinc-800">
                        Buyer paid for <strong>{s.order.shipping.service}</strong>
                        <br />
                        <span className="text-zinc-500">{usd(s.order.shipping.amount)} · ship with this service or faster</span>
                      </p>
                    ) : (
                      <p className="text-amber-700">Not charged at checkout. Contact the buyer to arrange freight.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-1.5">
                      <MapPin size={12} /> Ship to
                    </p>
                    {s.order.shipTo.length ? (
                      <p className="text-zinc-800 leading-relaxed">
                        {s.order.shipTo.map((line, i) => (
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="text-zinc-500">No address collected. Contact the buyer.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Buyer</p>
                    <p className="text-zinc-800">{s.order.buyer.name || "—"}</p>
                    {s.order.buyer.email && (
                      <a
                        href={`mailto:${s.order.buyer.email}?subject=${encodeURIComponent(`Your order: ${s.name} (${ref(s.id)})`)}`}
                        className="mt-1 flex items-center gap-1.5 text-blue-600 hover:text-zinc-900 break-all"
                      >
                        <Mail size={12} className="shrink-0" /> {s.order.buyer.email}
                      </a>
                    )}
                    {s.order.buyer.phone && (
                      <a
                        href={`tel:${s.order.buyer.phone}`}
                        className="mt-1 flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900"
                      >
                        <Phone size={12} /> {s.order.buyer.phone}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="px-5 py-4 text-sm text-zinc-500">
                  Order details aren&apos;t available for this sale (marked sold manually, or sold before online
                  checkout). Check your sale email or contact us.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
