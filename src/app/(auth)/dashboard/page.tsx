import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ToastListener } from "@/components/dashboard/ToastListener";
import { vendorArtifactService } from "@/services/(vendor)/artifacts";
import { ArtifactTable } from "@/components/dashboard/ArtifactTable";
import { StatFilters } from "@/components/dashboard/StatFilters";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    sort?: string; 
    search?: string; 
    limit?: string;
    availability?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  // Await searchParams as required by Next.js 15
  const { sort, search, limit, availability } = await searchParams;

  if (!token) return redirect("/login");

  // We fetch 'allItems' (no filters) for the stats cards 
  // and 'filteredItems' for the actual table.
  const [user, allItems, filteredItems] = await Promise.all([
    vendorArtifactService.getVendorData(token),
    vendorArtifactService.getMyItems(token, undefined, undefined, 100), // For stats
    vendorArtifactService.getMyItems(token, sort, search, Number(limit || 20), availability),
  ]);

  if (!user) return redirect("/login");

  // Calculate stats from allItems so they stay consistent
  const totalRevenue = allItems
    .filter(i => i.availability === "sold")
    .reduce((acc, i) => acc + (Number(i.purchase_price) || 0), 0);

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRevenue);

  const activeCount = allItems.filter(
    (i) => i.availability === "available",
  ).length;

  const soldCount = allItems.filter(
    (i) => i.availability === "sold",
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
            href="/dashboard/artifact/new"
            className="bg-zinc-900 text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all shadow-sm"
          >
            New Artifact
          </Link>
        </div>
      </header>

      {/* Using the new interactive component */}
      <StatFilters 
        activeCount={activeCount} 
        soldCount={soldCount} 
        formattedRevenue={formattedRevenue} 
      />

      {/* Table shows the filtered items */}
      <ArtifactTable items={filteredItems} token={token} />
    </div>
  );
}