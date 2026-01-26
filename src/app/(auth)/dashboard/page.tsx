import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ToastListener } from "@/components/dashboard/ToastListener";
import { vendorArtifactService } from "@/services/(vendor)/artifacts";
import { ArtifactTable } from "@/components/dashboard/ArtifactTable";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-zinc-200 p-8 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-light text-zinc-900 tracking-tighter">
        {value}
      </p>
    </div>
  );
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  // Await searchParams as required by Next.js 15
  const { sort } = await searchParams;

  if (!token) return redirect("/login");

  // Fetch data using the centralized service
  // We pass the sort parameter to getMyItems so Directus handles the order
  const [user, items] = await Promise.all([
    vendorArtifactService.getVendorData(token),
    vendorArtifactService.getMyItems(token, sort),
  ]);

  if (!user) return redirect("/login");

  const totalRevenue = items.reduce(
    (acc, i) => acc + (Number(i.purchase_price) || 0),
    0,
  );

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRevenue);

  const activeCount = items.filter(
    (i) => i.availability === "available",
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-0 text-zinc-900">
      <ToastListener />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-zinc-100 pb-8 gap-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight">
            Welcome back, {user.first_name}
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <Link
            href="dashboard/artifact/new"
            className="bg-zinc-900 text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all shadow-sm"
          >
            New Artifact
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <StatCard label="Active Listings" value={activeCount} />
        <StatCard label="Items Sold" value={items.length - activeCount} />
        <StatCard label="Total Revenue" value={formattedRevenue} />
      </section>

      <ArtifactTable items={items} token={token} />
    </div>
  );
}
