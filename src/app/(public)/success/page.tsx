import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { CheckCircle2, ArrowRight, Store, MessageSquare } from "lucide-react";
import { readItem } from "@directus/sdk";
import directus from "@/lib/directus";
import { notFound } from "next/navigation";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id || !session_id.startsWith("cs_")) notFound();

  // Verify the purchase with Stripe rather than trusting the URL.
  const session = await stripe.checkout.sessions
    .retrieve(session_id, { expand: ["line_items"] })
    .catch(() => null);

  if (!session || session.payment_status !== "paid") notFound();

  const item = {
    id: session.metadata?.itemId ?? "",
    name: session.line_items?.data[0]?.description ?? "Your item",
  };

  // The seller, for a "More from this shop" link. Public data; optional.
  let seller: { id: string; shopName: string } | null = null;
  if (/^\d+$/.test(item.id)) {
    try {
      const row = (await directus.request(
        readItem("props", item.id, { fields: [{ user_created: ["id", "shop_name"] }] }),
      )) as { user_created?: { id?: string; shop_name?: string | null } | null };
      const u = row.user_created;
      if (u?.id) seller = { id: u.id, shopName: u.shop_name?.trim() || "this shop" };
    } catch {
      seller = null;
    }
  }

  return (
    <main className="h-full w-full flex items-center justify-center p-6 py-12">
      <div className="max-w-xl w-full bg-white border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-12 relative overflow-hidden">
        {/* Subtle Decorative "Paid" Watermark */}
        <div className="absolute top-10 right-7.5 rotate-12 opacity-[0.03] select-none pointer-events-none">
          <h1 className="text-9xl font-black italic">PAID</h1>
        </div>

        <div className="relative z-10">
          <header className="mb-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-50 p-4 rounded-full">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-zinc-800 italic mb-2">
              Payment received
            </h1>
            <p className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
              Record ID:{" "}
              <span className="text-zinc-800 font-bold">
                CAS-{String(item.id).padStart(4, "0")}
              </span>
            </p>
          </header>

          <section className="border-y border-zinc-100 py-8 mb-10">
            <div className="flex justify-between items-baseline gap-8 mb-4">
              <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Item
              </span>
              <span className="min-w-0 text-right text-zinc-800 font-bold uppercase italic leading-snug break-words">
                {item.name}
              </span>
            </div>
            <div className="flex justify-between items-center gap-8">
              <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Status
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100 px-2 py-1 bg-blue-50">
                Paid in Full
              </span>
            </div>
          </section>

          <div className="space-y-6 text-sm leading-relaxed text-zinc-500 italic mb-10 border-l-2 border-zinc-200 pl-6">
            <p>Thank you for your purchase.</p>
            <p>
              We are now preparing your order and coordinating the shipping details. We&apos;ll be in touch shortly with an update.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/inventory"
              className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-lg shadow-zinc-200"
            >
              Continue Shopping <ArrowRight className="w-3 h-3" />
            </Link>

            {seller ? (
              <Link
                href={`/shop/${seller.id}`}
                className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-600 px-3 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 hover:text-zinc-900 transition-all text-center"
              >
                <Store className="w-3 h-3 shrink-0" />
                <span className="truncate">More from {seller.shopName}</span>
              </Link>
            ) : (
              <Link
                href={`/contact?type=general&item=${encodeURIComponent(`Order: ${item.name}`)}`}
                className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-600 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 hover:text-zinc-900 transition-all"
              >
                <MessageSquare className="w-3 h-3" /> Questions? Contact Us
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
