import { getAdminSession } from "@/lib/admin";
import { listVendors, type AdminVendor } from "@/lib/admin-data";
import { VendorManageList } from "@/components/dashboard/admin/VendorManageList";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const session = await getAdminSession(); // layout already 404s non-admins
  let vendors: AdminVendor[] = [];
  try {
    vendors = session ? await listVendors(session.client, ["active", "suspended"]) : [];
  } catch (err) {
    console.error("Failed to load vendors:", err);
    return <p className="text-sm text-red-600">Couldn&apos;t load vendors from Directus.</p>;
  }

  // Suspended vendors with no listings are rejected applicants; they live under Approvals.
  return <VendorManageList vendors={vendors.filter((v) => v.status === "active" || v.itemCount > 0)} />;
}
