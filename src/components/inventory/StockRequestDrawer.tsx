"use client";

import { useState, useEffect } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";

interface StockRequestDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialSearch?: string;
}

export default function StockRequestDrawer({
  isOpen,
  setIsOpen,
  initialSearch,
}: StockRequestDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      if (submitted) {
        const timer = setTimeout(() => setSubmitted(false), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div
      className={`fixed inset-0 z-100 transition-all duration-300 ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        className={`absolute right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header - Fixed Height */}
        <div className="p-8 md:p-12 pb-0 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold uppercase tracking-tighter text-zinc-900 italic leading-none">
              Inquiry
            </h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-blue-600 font-black">
              Stock Request Portal
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="group p-2 -mr-2 cursor-pointer"
          >
            <X
              size={24}
              className="text-zinc-300 group-hover:text-zinc-900 transition-colors"
            />
          </button>
        </div>

        {/* Content Area - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-10 custom-scrollbar">
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="h-full flex flex-col space-y-10"
            >
              <div className="space-y-8">
                <div className="border-l-2 border-zinc-100 pl-6 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    The Mission
                  </p>
                  <p className="text-sm text-zinc-600 leading-relaxed italic">
                    If the specific architectural artifact you require is not
                    currently in our local stock, our sources can initiate a
                    specialized search across the Hudson Valley.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                      Request Item
                    </label>
                    <input
                      type="text"
                      defaultValue={initialSearch}
                      placeholder="E.g. 19th Century French Doors"
                      required
                      className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="architect@firm.com"
                      required
                      className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                      Project Details
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Dimensions, quantity, or specific patina requirements..."
                      className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 text-white py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:bg-zinc-200 cursor-pointer"
                >
                  {loading ? (
                    "TRANSMITTING..."
                  ) : (
                    <>
                      <Send size={14} /> Submit Stock Request
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-tighter italic text-zinc-900">
                  Request Logged
                </h3>
                <p className="text-xs text-zinc-500 max-w-60 mx-auto leading-relaxed">
                  Your parameters have been distributed to our verified sources.
                  We will contact you if a match is identified.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors pt-4 cursor-pointer"
              >
                Return to Inventory
              </button>
            </div>
          )}
        </div>

        {/* Footer - Fixed Height */}
        <div className="p-8 md:p-12 pt-0 border-t border-zinc-50 mt-auto">
          <p className="text-[9px] text-zinc-400 uppercase tracking-tight leading-relaxed font-medium">
            * Source requests are prioritized for trade professionals and
            verified acquisition partners.
          </p>
        </div>
      </div>
    </div>
  );
}
