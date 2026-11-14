"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { X, Calculator, Truck, Mail, AlertCircle, Check, Lock } from "lucide-react";
import type { ShippingRate, ShippingQuoteResponse } from "@/app/api/shipping/types";
import { createCheckout } from "@/app/actions/checkout";

interface ShippingDrawerProps {
  id: string | number;
  itemName: string;
  price?: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  /**
   * checkout: trigger is the Purchase button; buyer picks a rate, then pays.
   * estimate: trigger is "Calculate Shipping" (item can't be bought on-site).
   * freight:  item too heavy / missing dimensions; manual quote only.
   */
  mode: "checkout" | "estimate" | "freight";
}

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function CheckoutButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-zinc-900 text-white py-5 text-label font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
    >
      <Lock size={14} /> {pending ? "Opening secure checkout..." : label}
    </button>
  );
}

export default function ShippingDrawer({ id, itemName, price, weight, length, width, height, mode }: ShippingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selected, setSelected] = useState<ShippingRate | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The server may decide rates can't be quoted, and says why.
  const [serverFreight, setServerFreight] = useState<null | "too_heavy" | "missing_dimensions" | "no_origin">(null);

  const isFreight = mode === "freight" || serverFreight !== null;
  // Only genuinely heavy/oversized pieces are "freight"; the other reasons are
  // missing seller info, which shouldn't be described to buyers as freight.
  const reason = serverFreight ?? (mode === "freight" ? "too_heavy" : null);
  const notice =
    reason === "no_origin"
      ? {
          title: "Shipping arranged after purchase",
          body: "Online shipping rates aren't available for this seller yet. You can still buy now, and the seller will contact you to arrange delivery and any shipping cost.",
        }
      : reason === "missing_dimensions"
        ? {
            title: "Shipping arranged after purchase",
            body: "This listing doesn't have its size and weight yet, so we can't quote shipping online. You can still buy now, and the seller will contact you to arrange delivery.",
          }
        : {
            title: "Freight shipping",
            body: "Because of its size or weight, this piece ships by freight or custom handling. We'll quote and arrange delivery with you directly.",
          };
  const isCheckout = mode === "checkout";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  const calculateShipping = async () => {
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    setLoading(true);
    setError(null);
    setRates([]);
    setSelected(null);

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, zipCode }),
      });
      const data = (await res.json()) as ShippingQuoteResponse | { error: string };

      if ("error" in data) {
        setError(data.error);
      } else if (data.mode === "freight") {
        setServerFreight(data.reason);
      } else {
        setRates(data.rates);
        setSelected(data.rates[0] ?? null); // cheapest preselected
      }
    } catch {
      setError("Couldn't reach the shipping service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ref = `CAS-${String(id).padStart(4, "0")}`;
  const handleFreightInquiry = () => {
    const subject = encodeURIComponent(`Freight Inquiry: ${ref}`);
    const body = encodeURIComponent(
      `Inquiry regarding shipping for: ${itemName}\nReference: ${ref}\nDestination ZIP: ${zipCode || "[Enter ZIP]"}\n\n` +
        `Specs: ${weight || "?"} lbs | ${length || "?"}" x ${width || "?"}" x ${height || "?"}"`,
    );
    window.location.href = `mailto:info@catskillas.com?subject=${subject}&body=${body}`;
  };

  const trigger =
    mode === "checkout" ? (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-zinc-800 text-white py-5 text-label font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]"
      >
        Purchase
      </button>
    ) : (
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full border py-4 text-label font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
          mode === "freight"
            ? "border-zinc-200 text-zinc-500 bg-zinc-50 hover:bg-zinc-100"
            : "border-zinc-300 text-zinc-500 hover:bg-zinc-800 hover:text-white hover:border-zinc-800"
        }`}
      >
        {mode === "freight" ? <Mail size={14} /> : <Calculator size={14} />}
        {mode === "freight" ? "Request Freight Quote" : "Calculate Shipping"}
      </button>
    );

  return (
    <>
      {trigger}

      <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? "visible" : "invisible"}`}>
        <div
          className={`absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#F9F8F6] shadow-2xl transition-transform duration-500 ease-out p-8 md:p-10 flex flex-col overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">
                {isCheckout ? "Checkout" : "Shipping"}
              </h2>
              <p className="text-detail uppercase tracking-widest text-zinc-500 font-bold mt-1">
                {isCheckout ? "Choose delivery" : "Estimate"}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer">
              <X size={24} className="text-zinc-500" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Item summary */}
            <div className="bg-white border border-zinc-200 p-6">
              <p className="text-detail font-black uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-50 pb-2">{ref}</p>
              <div className="flex justify-between items-start gap-4">
                <p className="text-sm font-bold text-zinc-800">{itemName}</p>
                {typeof price === "number" && <p className="text-sm font-bold text-zinc-800">{usd(price)}</p>}
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-label font-mono text-zinc-500 uppercase">{weight || "—"} LBS</span>
                <span className="text-label font-mono text-zinc-500 uppercase">
                  {length || "?"}&rdquo;×{width || "?"}&rdquo;×{height || "?"}&rdquo;
                </span>
              </div>
            </div>

            {/* ZIP entry */}
            {!isFreight && (
              <div className="space-y-4">
                <label className="block text-label font-black uppercase tracking-widest text-zinc-800">Delivery ZIP Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="12401"
                    className="flex-1 min-w-0 bg-white border border-zinc-200 p-4 font-mono text-lg text-zinc-700 focus:border-zinc-900 outline-none transition-colors"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && calculateShipping()}
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loading}
                    className="bg-zinc-900 text-white px-6 font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors text-label disabled:bg-zinc-300"
                  >
                    {loading ? "..." : "Get Rates"}
                  </button>
                </div>
                {error && (
                  <p className="text-detail font-bold text-red-600 uppercase italic flex items-center gap-2">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
              </div>
            )}

            {/* Results */}
            {isFreight ? (
              <div className="bg-white border border-zinc-200 p-8 text-center space-y-6">
                <Truck size={32} className="mx-auto text-zinc-800" strokeWidth={1} />
                <div>
                  <p className="text-label font-black uppercase tracking-widest text-zinc-800">{notice.title}</p>
                  <p className="text-base text-zinc-500 mt-3 leading-relaxed italic">{notice.body}</p>
                </div>
                {isCheckout ? (
                  <form action={createCheckout} className="space-y-3">
                    <input type="hidden" name="itemId" value={String(id)} />
                    <CheckoutButton label="Continue to Payment" />
                    <button
                      type="button"
                      onClick={handleFreightInquiry}
                      className="w-full border border-zinc-300 text-zinc-500 py-4 text-label font-bold uppercase tracking-[0.2em] hover:border-zinc-900 hover:text-zinc-900 transition-all"
                    >
                      Ask about shipping first
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={handleFreightInquiry}
                    className="w-full bg-zinc-900 text-white py-4 text-label font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                  >
                    <Mail size={14} /> Request Manual Quote
                  </button>
                )}
              </div>
            ) : rates.length > 0 ? (
              <div className="space-y-3" role="radiogroup" aria-label="Shipping options">
                {rates.map((rate) => {
                  const active = selected?.token === rate.token;
                  return (
                    <button
                      key={rate.token}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelected(rate)}
                      className={`w-full text-left flex justify-between items-center bg-white border p-5 transition-colors ${
                        active ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? "bg-zinc-900 border-zinc-900" : "border-zinc-300"}`}>
                          {active && <Check size={10} className="text-white" />}
                        </span>
                        <div>
                          <p className="text-detail font-black text-zinc-500 uppercase tracking-widest mb-1">
                            {rate.provider} • {rate.service}
                          </p>
                          <p className="text-sm font-bold text-zinc-800 italic">
                            {rate.estimatedDays ? `Est. ${rate.estimatedDays} day delivery` : "Delivery time varies"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-light text-zinc-900">{usd(rate.price)}</p>
                    </button>
                  );
                })}

                {isCheckout && selected && (
                  <form action={createCheckout} className="pt-4 space-y-3">
                    <input type="hidden" name="itemId" value={String(id)} />
                    <input type="hidden" name="shippingQuote" value={selected.token} />
                    {typeof price === "number" && (
                      <div className="flex justify-between text-sm text-zinc-600 border-t border-zinc-200 pt-4">
                        <span>Total with shipping</span>
                        <span className="font-bold text-zinc-900">{usd(price + selected.price)}</span>
                      </div>
                    )}
                    <CheckoutButton label="Continue to Payment" />
                    <p className="text-detail text-zinc-500 text-center">
                      Enter a delivery address in ZIP {zipCode} at checkout.
                    </p>
                  </form>
                )}
              </div>
            ) : (
              !loading &&
              !error && (
                <div className="py-14 text-center border border-dashed border-zinc-200 opacity-60">
                  <Truck size={24} className="mx-auto text-zinc-500 mb-3" />
                  <p className="text-detail uppercase font-black text-zinc-500 tracking-widest">
                    Enter your ZIP to see delivery options
                  </p>
                </div>
              )
            )}
          </div>

          <div className="mt-auto border-t border-zinc-200 pt-6">
            <p className="text-detail text-zinc-500 uppercase tracking-tight leading-relaxed italic">
              * rates include careful packing. Items over {100} lbs ship by freight, quoted separately.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
