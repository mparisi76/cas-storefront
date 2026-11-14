import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ToastListener } from "@/components/dashboard/ToastListener";
import { vendorArtifactService } from "@/services/(vendor)/artifacts";
import { ArtifactTable } from "@/components/dashboard/ArtifactTable";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { getAwaitingShipmentCount, getVendorSales, type VendorSale } from "@/lib/vendor-sales";

export const dynamic = "force-dynamic";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; show?: string; sort?: string; search?: string; limit?: string }>;
}) {
  const token = (await cookies()).get("directus_session")?.value;
  if (!token) return redirect("/login");

  const { tab, show, sort, search, limit } = await searchParams;
  const activeTab: "listings" | "orders" = tab === "orders" ? "orders" : "listings";
  // Orders filter: all sold items, only ones still to ship, or only shipped.
  const ordersFilter: "all" | "awaiting" | "shipped" = show === "awaiting" || show === "shipped" ? show : "all";

  // Stats + whichever tab is open. The orders tab also needs Stripe (buyer,
  // ship-to), so it's only loaded when that tab is showing.
  const [user, allItems, awaiting, listings, orders] = await Promise.all([
    vendorArtifactService.getVendorData(token),
    vendorArtifactService.getMyItems(token, undefined, undefined, 500),
    getAwaitingShipmentCount(token),
    activeTab === "listings"
      ? vendorArtifactService.getMyItems(token, sort, search, Number(limit || 20), "available")
      : Promise.resolve([]),
    activeTab === "orders"
      ? getVendorSales(token)
          .then((r) => ({ ...r, loadError: false }))
          .catch((err) => {
            console.error("Failed to load vendor sales:", err);
            return { sales: [] as VendorSale[], trackingSupported: false, loadError: true };
          })
      : Promise.resolve(null),
  ]);

  if (!user) return redirect("/login");

  const activeCount = allItems.filter((i) => i.availability === "available").length;
  const sold = allItems.filter((i) => i.availability === "sold");
  const revenue = sold.reduce((sum, i) => sum + (Number(i.purchase_price) || 0), 0);

  const cards: { label: string; value: string; href?: string; highlight?: boolean; active?: boolean }[] = [
    { label: "Active Listings", value: String(activeCount), href: "/dashboard", active: activeTab === "listings" },
    ...(awaiting !== null
      ? [
          {
            label: "Awaiting Shipment",
            value: String(awaiting),
            href: "/dashboard?tab=orders&show=awaiting",
            highlight: awaiting > 0 && !(activeTab === "orders" && ordersFilter === "awaiting"),
            active: activeTab === "orders" && ordersFilter === "awaiting",
          },
        ]
      : []),
    {
      label: "Sold",
      value: String(sold.length),
      href: "/dashboard?tab=orders",
      active: activeTab === "orders" && ordersFilter !== "awaiting",
    },
    { label: "Total Sales", value: usd(revenue) },
  ];

  const hasShipFrom =
    (user.street_address?.trim() && user.city?.trim() && user.state?.trim() && /^\d{5}$/.test(user.zip_code?.trim() ?? "")) ||
    (user.ship_from_street?.trim() &&
      user.ship_from_city?.trim() &&
      user.ship_from_state?.trim() &&
      /^\d{5}$/.test(user.ship_from_zip?.trim() ?? ""));

  const tabs = [
    { key: "listings", label: "Listings", href: "/dashboard", count: activeCount },
    { key: "orders", label: "Orders", href: "/dashboard?tab=orders", badge: awaiting ? `${awaiting} to ship` : null },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-6 py-0 text-zinc-900">
      <ToastListener />

      <header className="mb-10 border-b border-zinc-100 pb-8">
        <h1 className="text-2xl font-light tracking-tight">Welcome back, {user.first_name}</h1>
      </header>

      {/* Without a ship-from address, buyers can't get shipping rates for this vendor's items. */}
      {!hasShipFrom && (
        <div className="mb-10 border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-amber-900">
            <strong>Add your ship-from address.</strong> Without it, buyers can&apos;t see shipping rates for your items,
            and checkout falls back to &ldquo;shipping arranged after purchase.&rdquo;
          </p>
          <Link
            href="/dashboard/settings"
            className="shrink-0 bg-zinc-900 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors text-center"
          >
            Go to Settings
          </Link>
        </div>
      )}

      {/* Summary cards (clickable ones switch tabs) */}
      <section className={`grid grid-cols-2 ${cards.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 mb-10`}>
        {cards.map((c) => {
          const inner = (
            <>
              <p
                className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${c.highlight ? "text-amber-700" : "text-zinc-500"}`}
              >
                {c.label}
              </p>
              <p className="text-2xl md:text-3xl font-light tracking-tighter">{c.value}</p>
            </>
          );
          const cls = `relative block p-6 border transition-colors ${
            c.highlight
              ? "border-amber-300 bg-amber-50 hover:border-amber-400"
              : c.active
                ? "border-zinc-900 bg-zinc-50"
                : "border-zinc-200 bg-white hover:border-zinc-400"
          }`;
          return c.href ? (
            <Link key={c.label} href={c.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <div key={c.label} className={cls}>
              {inner}
            </div>
          );
        })}
      </section>

      {/* Tabs */}
      <nav className="flex gap-8 border-b border-zinc-200 mb-8">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`-mb-px pb-4 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                active ? "text-zinc-900 font-bold border-b-2 border-zinc-900" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {t.label}
              {"badge" in t && t.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold tracking-normal normal-case">
                  {t.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {activeTab === "listings" ? (
        <ArtifactTable items={listings} />
      ) : (
        <OrdersList
          sales={orders?.sales ?? []}
          trackingSupported={orders?.trackingSupported ?? false}
          loadError={orders?.loadError ?? false}
          filter={ordersFilter}
        />
      )}
    </div>
  );
}
