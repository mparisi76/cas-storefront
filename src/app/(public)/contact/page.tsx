"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { SubmissionSuccess } from "@/components/inventory/SubmissionSuccess";

function ContactForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "general";
  const initialItem = searchParams.get("item") || "";

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      type: formData.get("type"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Transmission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Connectivity error.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <SubmissionSuccess />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Left Column: Branding/Info */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-2xl font-bold uppercase tracking-tighter italic text-zinc-900 leading-[0.85]">
              Contact
            </h1>
          </div>

          <div className="space-y-12 border-l-2 border-zinc-100 pl-8">
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">
                  Location
                </h4>
                <p className="text-sm text-zinc-500 italic uppercase">
                  Hudson Valley, New York
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">
                  Direct Outreach
                </h4>
                <p className="text-sm text-zinc-500 italic uppercase underline decoration-zinc-200 underline-offset-4 break-all">
                  catskillarchitecturalsalvage@gmail.com
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-3 flex items-center gap-2">
                  <Clock size={12} /> Hours
                </h4>
                <p className="text-[11px] text-zinc-500 uppercase tracking-tight leading-relaxed">
                  Studio Visits by Appointment Only
                  {/* <br /> */}
                  {/* Digital Inquiries: Mon—Fri, 9am—5pm */}
                </p>
              </div>

              {/* <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-3 flex items-center gap-2">
                  <Instagram size={12} /> Field Log
                </h4>
                <a
                  href="https://instagram.com/catskillarchitecturalsalvage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 italic uppercase hover:text-blue-600 transition-colors"
                >
                  @catskillarchitecturalsalvage
                </a>
              </div> */}
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed uppercase tracking-tight max-w-xs pt-4">
              Specialized search services are prioritized for trade
              professionals, architects, and verified acquisition partners.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-10 bg-white border border-zinc-100 p-8 md:p-12 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                Name
              </label>
              <input
                name="name"
                required
                type="text"
                className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-400"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                Email
              </label>
              <input
                name="email"
                required
                type="email"
                className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors placeholder:text-zinc-400"
                placeholder="email@firm.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
              Inquiry Type
            </label>
            <div className="relative">
              <select
                name="type"
                defaultValue={initialType}
                className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="general">General Inquiry</option>
                <option value="request">Stock Request (Search)</option>
                <option value="shipping">Logistics & Freight</option>
                <option value="vendor">Become a Vendor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
              Message / Item Details
            </label>
            <textarea
              name="message"
              rows={5}
              defaultValue={initialItem ? `Requesting: ${initialItem}` : ""}
              required
              placeholder="The more details you can provide, the more likely we can help you"
              className="w-full bg-transparent border-b border-zinc-200 py-3 font-medium text-zinc-800 focus:border-zinc-900 outline-none transition-colors resize-none placeholder:text-zinc-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:bg-zinc-200 cursor-pointer"
          >
            {loading ? (
              "TRANSMITTING..."
            ) : (
              <>
                <Send size={14} /> Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-[#F9F8F6] min-h-screen py-20 px-4 md:px-10">
      <div className="mb-12">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Inventory
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-20 uppercase font-mono text-[10px] tracking-widest">
            Loading Form...
          </div>
        }
      >
        <ContactForm />
      </Suspense>
    </main>
  );
}
