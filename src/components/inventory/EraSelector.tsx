"use client";

import Link from "next/link";
import { useMemo } from "react";

interface EraSelectorProps {
  activeEra: string;
  params: { [key: string]: string | string[] | undefined };
  eraOptions: string[];
}

export default function EraSelector({
  activeEra,
  params,
  eraOptions,
}: EraSelectorProps) {
  // Calculate dynamic dates once per render
  const eraData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const antiqueYear = currentYear - 100;

    return {
      antique: `Pre-${antiqueYear}`,
      vintage: `${antiqueYear}–1980`,
      modern: `1980–Present`,
    };
  }, []);

  return (
    <div className="sticky top-20 lg:static z-40 -mx-4 md:-mx-10 lg:mx-0 w-[calc(100%+2rem)] md:w-[calc(100%+5rem)] lg:w-auto bg-[#F9F8F6] lg:bg-transparent border-b border-zinc-200 lg:border-none">
      <div className="flex items-center gap-4 md:gap-8 px-8 lg:px-0 py-4 lg:py-0 overflow-visible whitespace-nowrap">
        <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-zinc-800 leading-none shrink-0">
          Era:
        </span>

        <div className="flex items-center gap-4 md:gap-6 h-12">
          {eraOptions.map((era) => {
            const eraKey = era.toLowerCase() as keyof typeof eraData;
            const years = eraData[eraKey];

            return (
              <div
                key={era}
                className="relative group flex flex-col items-center"
              >
                <Link
                  href={{
                    pathname: "/inventory",
                    query: {
                      ...params,
                      classification: era,
                      page: 1,
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

                {/* TOOLTIP: Now using z-50 and positioning that avoids clipping */}
                {years && (
                  <div className="absolute top-full mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="bg-zinc-800 text-white text-[8px] font-mono tracking-[0.2em] px-2 py-1 shadow-md whitespace-nowrap uppercase">
                      {years}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
