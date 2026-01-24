// components/EraSelector.tsx
'use client';

import Link from 'next/link';

interface EraSelectorProps {
  activeEra: string;
  params: { [key: string]: string | string[] | undefined };
  eraOptions: string[];
}

export default function EraSelector({ activeEra, params, eraOptions }: EraSelectorProps) {
  return (
    <div className="sticky top-20 lg:static z-40 -mx-4 md:-mx-10 lg:mx-0 w-[calc(100%+2rem)] md:w-[calc(100%+5rem)] lg:w-auto bg-[#F9F8F6] lg:bg-transparent border-b border-zinc-200 lg:border-none">
      <div className="flex items-baseline gap-4 md:gap-8 px-8 lg:px-0 py-4 lg:py-0 overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-zinc-800 leading-none shrink-0">
          Era:
        </span>
        <div className="flex items-baseline gap-4 md:gap-6 h-6">
          {eraOptions.map((era) => (
            <Link
              key={era}
              href={{
                pathname: "/inventory",
                query: {
									...params,
									classification: era,
      						page: 1
								},
              }}
							
              className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative pb-1 leading-none shrink-0 ${
                activeEra === era || (!activeEra && era === "all")
                  ? "text-blue-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-blue-600"
                  : "text-zinc-400 hover:text-zinc-800"
              }`}
            >
              {era}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}