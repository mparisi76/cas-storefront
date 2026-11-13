import { getAdminSession } from "@/lib/admin";
import { listVendors, type AdminVendor } from "@/lib/admin-data";
import { VendorApprovalList } from "@/components/dashboard/VendorApprovalList";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const session = await getAdminSession(); // layout already 404s non-admins
  let applicants: AdminVendor[] = [];
  let loadError = false;
  try {
    applicants = session ? await listVendors(session.client, ["draft", "suspended"]) : [];
  } catch (err) {
    console.error("Failed to load vendor applications:", err);
    loadError = true;
  }

  if (loadError) return <p className="text-sm text-red-600">Couldn&apos;t load vendor applications from Directus.</p>;

  const pending = applicants.filter((v) => v.status === "draft");
  // Suspended vendors with no listings are almost always rejected applicants.
  const rejected = applicants.filter((v) => v.status === "suspended" && v.itemCount === 0);

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
          Awaiting Approval ({pending.length})
        </h2>
        <VendorApprovalList
          vendors={pending}
          mode="pending"
          emptyMessage="No applications waiting. You're all caught up."
        />
      </section>

      {rejected.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
            Rejected ({rejected.length})
          </h2>
          <VendorApprovalList vendors={rejected} mode="rejected" emptyMessage="" />
        </section>
      )}
    </div>
  );
}
