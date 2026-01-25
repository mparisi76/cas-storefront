"use client";

import { useState, useEffect } from "react";
import { X, Calculator, Truck, Mail, AlertCircle } from "lucide-react";
import { ShippingRate } from "@/app/api/shipping/types";

interface ShippingDrawerProps {
  weight: number;
  length: number;
  width: number;
  height: number;
  itemName: string;
  id: string | number;
  disabled?: boolean;
}

export default function ShippingDrawer({
  id,
  itemName,
  weight,
  length,
  width,
  height,
  disabled,
}: ShippingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFreight, setIsFreight] = useState(false);

  // Auto-trigger Freight mode if dimensions are missing or excessively large
  useEffect(() => {
    if (disabled) {
      setIsFreight(true);
    }
  }, [disabled]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const calculateShipping = async () => {
    if (!zipCode || zipCode.length < 5) {
      setError("Please enter a valid zip code");
      return;
    }

    setLoading(true);
    setError(null);
    setRates([]);
    setIsFreight(false);

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, weight, length, width, height }),
      });

      const data = await res.json();

      if (data.error === "Freight Required" || weight > 150) {
        setIsFreight(true);
      } else if (data.error) {
        setError(data.message || "Shipping calculation unavailable.");
      } else if (data.length === 0) {
        setError("No standard rates found. Freight inquiry recommended.");
      } else {
        setRates(data);
      }
    } catch {
      setError("Connectivity issue with shipping carrier.");
    } finally {
      setLoading(false);
    }
  };

  const handleFreightInquiry = () => {
    const subject = encodeURIComponent(`Freight Inquiry: CAS—${String(id).padStart(4, "0")}`);
    const body = encodeURIComponent(
      `Inquiry regarding logistics for: ${itemName}\n` +
      `Reference: CAS—${String(id).padStart(4, "0")}\n` +
      `Destination Zip: ${zipCode || "[Enter Zip]"}\n\n` +
      `Specs: ${weight} lbs | ${length}" x ${width}" x ${height}"`
    );
    window.location.href = `mailto:info@catskillas.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full border py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
          disabled 
            ? "border-zinc-200 text-zinc-400 bg-zinc-50 hover:bg-zinc-100" 
            : "border-zinc-300 text-zinc-500 hover:bg-zinc-800 hover:text-white hover:border-zinc-800"
        }`}
      >
        {disabled ? <Mail size={14} /> : <Calculator size={14} />}
        {disabled ? "Request Freight Quote" : "Calculate Shipping"}
      </button>

      <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? "visible" : "invisible"}`}>
        <div 
          className={`absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsOpen(false)} 
        />

        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#F9F8F6] shadow-2xl transition-transform duration-500 ease-out p-10 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-800 italic leading-none">Logistics</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">Registry Estimate</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer">
              <X size={24} className="text-zinc-400" />
            </button>
          </div>

          <div className="space-y-10">
            {/* Item Summary Card */}
            <div className="bg-white border border-zinc-200 p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-50 pb-2">Artifact Manifest</p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-800">{itemName}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">{weight || "—"} LBS</span>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">Size: {length || "0"}&rdquo;×{width || "0"}&rdquo;×{height || "0"}&rdquo;</span>
                </div>
              </div>
            </div>

            {/* Input Section */}
            {!disabled && (
              <div className="space-y-4">
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-800">Destination Zip Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="12401"
                    className="flex-1 bg-white border border-zinc-200 p-4 font-mono text-lg text-zinc-700 focus:border-zinc-900 outline-none transition-colors"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loading}
                    className="bg-zinc-900 text-white px-8 font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors text-[11px] disabled:bg-zinc-200"
                  >
                    {loading ? "..." : "Get Rates"}
                  </button>
                </div>
                {error && <p className="text-[10px] font-bold text-red-600 uppercase italic flex items-center gap-2"><AlertCircle size={12}/> {error}</p>}
              </div>
            )}

            {/* Results Display */}
            <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
              {isFreight || disabled ? (
                <div className="bg-white border border-zinc-200 p-8 text-center space-y-6">
                  <Truck size={32} className="mx-auto text-zinc-800" strokeWidth={1} />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Specialized Handling Required</p>
                    <p className="text-[12px] text-zinc-500 mt-3 leading-relaxed italic">
                      Due to the architectural scale or weight of this piece, standard parcel service is unavailable. We utilize specialized crate-and-freight carriers.
                    </p>
                  </div>
                  <button
                    onClick={handleFreightInquiry}
                    className="w-full bg-zinc-900 text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                  >
                    <Mail size={14} /> Request Manual Quote
                  </button>
                </div>
              ) : (
                rates.map((rate, i) => (
                  <div key={i} className="flex justify-between items-center bg-white border border-zinc-200 p-5 hover:border-zinc-900 transition-colors">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{rate.provider} • {rate.service}</p>
                      <p className="text-sm font-bold text-zinc-800 italic">Est. {rate.estimated_days} Day Delivery</p>
                    </div>
                    <p className="text-xl font-light text-zinc-900">${parseFloat(rate.price).toFixed(2)}</p>
                  </div>
                ))
              )}

              {!loading && rates.length === 0 && !error && !isFreight && !disabled && (
                <div className="py-16 text-center border border-dashed border-zinc-200 opacity-50">
                  <Truck size={24} className="mx-auto text-zinc-400 mb-3" />
                  <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Awaiting Destination</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-zinc-200 pt-8">
            <p className="text-[10px] text-zinc-400 uppercase tracking-tight leading-relaxed italic">
              * rates include white-glove packaging. definitive transit costs finalized upon invoice.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
