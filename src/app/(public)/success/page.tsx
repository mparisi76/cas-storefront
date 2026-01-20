import Link from "next/link";
import directus from "@/lib/directus";
import { readItem } from "@directus/sdk";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";
import { notFound } from "next/navigation";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  if (!id) notFound();

  // Fetch the item details for the receipt view
  let item;
  try {
    item = await directus.request(
      readItem("props", id, {
        fields: ["name", "id", "purchase_price"],
      }),
    );
  } catch (error) {
    console.error("Error fetching item for success page:", error);
    notFound();
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
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Artifact
              </span>
              <span className="text-zinc-800 font-bold uppercase italic">
                {item.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
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
              Catalog <ArrowRight className="w-3 h-3" />
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 border border-zinc-200 text-zinc-500 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 transition-all"
            >
              <Home className="w-3 h-3" /> Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
