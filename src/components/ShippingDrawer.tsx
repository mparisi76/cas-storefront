"use client";

import { useState, useEffect } from "react";
import { X, Calculator, Truck, Mail } from "lucide-react";
import { ShippingRate } from "@/app/api/shipping/types";

interface ShippingProps {
  id: string | number;
  itemName: string;
  weight: number;
  length: number;
  width: number;
  height: number;
}

export default function ShippingDrawer({
  id,
  itemName,
  weight,
  length,
  width,
  height,
}: ShippingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFreight, setIsFreight] = useState(false);

  // Prevent background scrolling when drawer is active
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

      // Handle the Freight Gatekeeper from the API
      if (data.error === "Freight Required") {
        setIsFreight(true);
      } else if (data.error) {
        setError("Shipping calculation unavailable for this zip code.");
      } else {
        setRates(data);
      }
    } catch (err) {
      setError("Unable to connect to shipping service.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFreightInquiry = () => {
    const subject = encodeURIComponent(
      `Freight Quote Request: CAS-${String(id).padStart(4, "0")}`
    );
    const body = encodeURIComponent(
      `Hello Catskill Architectural Salvage,\n\n` +
        `I am interested in a freight quote for the following item:\n\n` +
        `Item: ${itemName}\n` +
        `Inventory ID: CAS-${String(id).padStart(4, "0")}\n` +
        `Dimensions: ${length}" x ${width}" x ${height}"\n` +
        `Weight: ${weight} lbs\n` +
        `Destination Zip Code: ${zipCode}\n\n` +
        `Please provide an estimated shipping cost and timeline for this piece.`
    );
    window.location.href = `mailto:info@catskillsalvage.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border border-zinc-300 py-4 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 hover:bg-zinc-800 hover:text-white hover:border-zinc-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
      >
        <Calculator size={16} />
        Calculate Shipping
      </button>

      {/* Drawer Overlay System */}
      <div
        className={`fixed inset-0 z-50 transition-visibility duration-300 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Dark Backdrop */}
        <div
          className={`absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#F9F8F6] shadow-2xl transition-transform duration-500 ease-out p-10 flex flex-col ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter text-zinc-600 italic">
                Shipping
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                Logistics Estimate
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
            >
              <X size={24} className="text-zinc-400" />
            </button>
          </div>

          <div className="space-y-10">
            {/* Item Summary Card */}
            <div className="bg-white border border-zinc-200 p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                Item Specifications
              </p>
              <div className="flex justify-between items-end">
                <p className="text-lg font-medium text-zinc-600 italic">
                  {weight} lbs
                </p>
                <p className="text-sm font-mono text-zinc-400">{`${length}" × ${width}" × ${height}"`}</p>
              </div>
            </div>

            {/* Zip Input Section */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Destination Zip Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={5}
                  placeholder="12401"
                  className="flex-1 bg-white border border-zinc-200 p-4 font-mono text-lg text-zinc-700 focus:border-blue-600 outline-none transition-colors"
                  value={zipCode}
                  onChange={(e) =>
                    setZipCode(e.target.value.replace(/\D/g, ""))
                  }
                />
                <button
                  onClick={calculateShipping}
                  disabled={loading}
                  className="bg-zinc-800 text-white px-6 font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors text-xs disabled:bg-zinc-300 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Get Rates"}
                </button>
              </div>
              {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase italic">
                  {error}
                </p>
              )}
            </div>

            {/* Rates/Freight Display */}
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {isFreight && (
                <div className="bg-zinc-100 border border-zinc-200 p-8 text-center space-y-5">
                  <Truck size={32} className="mx-auto text-zinc-400" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
                      Freight Notice
                    </p>
                    <p className="text-[12px] text-zinc-500 mt-2 leading-relaxed italic">
                      Due to the weight of this piece, standard
                      carrier service is unavailable. We offer specialized
                      freight handling.
                    </p>
                  </div>
                  <button
                    onClick={handleFreightInquiry}
                    className="w-full bg-blue-600 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Mail size={14} /> Request Freight Quote
                  </button>
                </div>
              )}

              {rates.map((rate, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white border-l-4 border-l-blue-600 border border-zinc-200 p-5 shadow-sm"
                >
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                      {rate.provider} {rate.service}
                    </p>
                    <p className="text-sm font-bold text-zinc-600 italic">
                      Est. {rate.estimated_days} Days Delivery
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-light text-blue-600">
                      ${parseFloat(rate.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {!loading && rates.length === 0 && !error && !isFreight && (
                <div className="py-12 text-center border-2 border-dashed border-zinc-200">
                  <Truck size={32} className="mx-auto text-zinc-400 mb-2" />
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                    Enter zip to see rates
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-zinc-200 pt-8">
            <p className="text-[10px] text-zinc-500 uppercase tracking-tight leading-relaxed italic">
              * Rates include specialized packing for architectural transit.
              Final logistics confirmed at checkout.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
