import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DirectusUser } from "@/types/dashboard";
import { Artifact } from "@/types/product";
import { ToastListener } from "@/components/dashboard/ToastListener"; // Import here

async function getVendorData(token: string): Promise<{ data: DirectusUser | null }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me?fields=first_name,last_name,id`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return { data: null };
    return res.json();
  } catch {
    return { data: null };
  }
}

async function getVendorItems(token: string): Promise<{ data: Artifact[] }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/props?fields=id,name,availability,purchase_price,date_created&filter[status][_eq]=published`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return { data: [] };
    const json = await res.json();
    return { data: json.data || [] };
  } catch {
    return { data: [] };
  }
}

export default async function PortalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  const [userData, itemData] = await Promise.all([
    getVendorData(token!),
    getVendorItems(token!),
  ]);

  const user = userData.data;
  if (!user) return redirect("/login");

  const items = itemData.data;

  const totalRevenue = items.reduce((acc, i) => acc + (Number(i.purchase_price) || 0), 0);
  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRevenue);

  const activeCount = items.filter((i) => i.availability === "available").length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-0 text-zinc-900">
      {/* This component handles the "Success" toast logic when redirecting 
          from the Edit page. It's a Client Component nested in this Server Component.
      */}
      <ToastListener />

      {/* Header */}
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

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard label="Active Listings" value={activeCount} />
        <StatCard label="Items Sold" value={items.length - activeCount} />
        <StatCard label="Total Revenue" value={formattedRevenue} />
      </section>

      {/* Table */}
      <div className="overflow-x-auto border border-zinc-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Artifact Description
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">
                Price
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-6 text-sm font-medium text-zinc-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        item.availability === "available"
                          ? "bg-green-50 text-green-700"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {item.availability}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-sm text-zinc-600 text-right font-mono">
                    ${Number(item.purchase_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <Link
                      href={`dashboard/artifact/edit/${item.id}`}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-20 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                >
                  No artifacts listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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