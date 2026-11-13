import Link from "next/link";

export const LEGAL_UPDATED = "November 11, 2026";
export const CONTACT_EMAIL = "info@catskillas.com";

/** Shared layout for Terms, Privacy, and Shipping & Returns, matching the About page. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F9F8F6] text-zinc-800 pb-32">
      <div className="max-w-2xl mx-auto px-6 md:px-8 pt-20 md:pt-28">
        <header className="mb-14 pb-10 border-b border-zinc-200">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600/70 mb-6">{eyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-[0.95] text-zinc-900 mb-6">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-zinc-600">{intro}</p>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            Last updated {LEGAL_UPDATED}
          </p>
        </header>

        <div className="space-y-12 text-base leading-relaxed text-zinc-700 [&_h2]:text-[11px] [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-[0.3em] [&_h2]:text-zinc-900 [&_h2]:mb-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:mb-4 [&_a]:underline [&_a:hover]:text-blue-600">
          {children}
        </div>

        <nav className="mt-20 pt-8 border-t border-zinc-200 flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
          <Link href="/terms" className="hover:text-blue-600">Terms</Link>
          <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
          <Link href="/returns" className="hover:text-blue-600">Shipping &amp; Returns</Link>
          <Link href="/contact" className="hover:text-blue-600">Contact</Link>
        </nav>
      </div>
    </main>
  );
}
