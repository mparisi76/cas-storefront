import "server-only";
import { aggregate, readItems, readUsers } from "@directus/sdk";
import type { getAdminSession } from "@/lib/admin";

type AdminClient = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>["client"];

export type AdminVendor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  shop_name: string | null;
  inventory_type: string | null;
  status: "draft" | "active" | "suspended" | string;
  featured_vendor: boolean | null;
  itemCount: number;
};

export type AdminSale = {
  id: number;
  name: string;
  purchase_price: string | number | null;
  date_sold: string | null;
  vendor: string;
  /** undefined = tracking fields not set up in Directus yet */
  shipped?: { date: string | null; carrier: string | null; number: string | null } | null;
};

export type AdminStats = {
  pendingVendors: number;
  activeVendors: number;
  itemsForSale: number;
  sales30Count: number;
  sales30Revenue: number;
};

const vendorRoleId = () => {
  const id = process.env.DIRECTUS_VENDOR_ROLE_ID;
  if (!id) throw new Error("DIRECTUS_VENDOR_ROLE_ID is not configured.");
  return id;
};

const num = (v: unknown) => Number(v ?? 0) || 0;

const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

async function countUsers(client: AdminClient, status: string) {
  const res = await client.request(
    aggregate("directus_users", {
      aggregate: { count: "*" },
      query: { filter: { role: { _eq: vendorRoleId() }, status: { _eq: status } } },
    }),
  );
  return num(res[0]?.count);
}

export async function getAdminStats(client: AdminClient): Promise<AdminStats> {
  const [pendingVendors, activeVendors, forSale, sales] = await Promise.all([
    countUsers(client, "draft"),
    countUsers(client, "active"),
    client.request(
      aggregate("props", {
        aggregate: { count: "*" },
        query: { filter: { status: { _eq: "published" }, availability: { _eq: "available" } } },
      }),
    ),
    client.request(
      aggregate("props", {
        aggregate: { count: "*", sum: ["purchase_price"] },
        query: { filter: { availability: { _eq: "sold" }, date_sold: { _gte: thirtyDaysAgo() } } },
      }),
    ),
  ]);

  const salesRow = sales[0] as { count?: unknown; sum?: { purchase_price?: unknown } } | undefined;

  return {
    pendingVendors,
    activeVendors,
    itemsForSale: num(forSale[0]?.count),
    sales30Count: num(salesRow?.count),
    sales30Revenue: num(salesRow?.sum?.purchase_price),
  };
}

/** Vendors in the given statuses, with how many listings each has. */
export async function listVendors(client: AdminClient, statuses: string[]): Promise<AdminVendor[]> {
  const [users, counts] = await Promise.all([
    client.request(
      readUsers({
        fields: [
          "id",
          "first_name",
          "last_name",
          "email",
          "shop_name",
          "inventory_type",
          "status",
          "featured_vendor",
        ],
        filter: { role: { _eq: vendorRoleId() }, status: { _in: statuses } },
        sort: ["shop_name"],
        limit: -1,
      }),
    ),
    client.request(
      aggregate("props", {
        aggregate: { count: "*" },
        groupBy: ["user_created"],
        query: { filter: { status: { _eq: "published" } } },
      }),
    ),
  ]);

  const byVendor = new Map<string, number>();
  for (const row of counts as unknown as { user_created: string | null; count: unknown }[]) {
    if (row.user_created) byVendor.set(row.user_created, num(row.count));
  }

  return (users as unknown as Omit<AdminVendor, "itemCount">[]).map((u) => ({
    ...u,
    itemCount: byVendor.get(u.id) ?? 0,
  }));
}

/** Most recent sales across all vendors. */
export async function listRecentSales(client: AdminClient, limit = 50): Promise<AdminSale[]> {
  const rows = (await client.request(
    readItems("props", {
      fields: [
        "id",
        "name",
        "purchase_price",
        "date_sold",
        { user_created: ["first_name", "last_name", "shop_name"] },
      ],
      filter: { availability: { _eq: "sold" } },
      sort: ["-date_sold", "-id"],
      limit,
    }),
  )) as unknown as {
    id: number;
    name: string;
    purchase_price: string | number | null;
    date_sold: string | null;
    user_created: { first_name: string | null; last_name: string | null; shop_name: string | null } | null;
  }[];

  // Tracking fields read separately so this still works before they exist.
  let tracking: Map<number, AdminSale["shipped"]> | null = null;
  try {
    const t = (await client.request(
      readItems("props", {
        filter: { id: { _in: rows.map((r) => r.id) } },
        fields: ["id", "date_shipped", "tracking_carrier", "tracking_number"],
        limit: rows.length || 1,
      }),
    )) as unknown as { id: number; date_shipped: string | null; tracking_carrier: string | null; tracking_number: string | null }[];
    tracking = new Map(
      t.map((x) => [
        x.id,
        x.date_shipped || x.tracking_number
          ? { date: x.date_shipped, carrier: x.tracking_carrier, number: x.tracking_number }
          : null,
      ]),
    );
  } catch {
    tracking = null;
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    purchase_price: r.purchase_price,
    date_sold: r.date_sold,
    shipped: tracking ? (tracking.get(r.id) ?? null) : undefined,
    vendor:
      r.user_created?.shop_name ||
      `${r.user_created?.first_name ?? ""} ${r.user_created?.last_name ?? ""}`.trim() ||
      "Unknown",
  }));
}

export const formatUSD = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num(n));
