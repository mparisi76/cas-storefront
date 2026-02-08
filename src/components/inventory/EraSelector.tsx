"use client";

import Link from "next/link";
import { useMemo } from "react";

interface EraSelectorProps {
  activeEra: string;
  params: { [key: string]: string | string[] | undefined };
  eraOptions: string[];
  className?: string;
}

export default function EraSelector({
  activeEra,
  params,
  eraOptions,
  className = "",
}: EraSelectorProps) {
  const eraData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const antiqueYear = currentYear - 100;

    return {
      antique: `Pre-${antiqueYear}`,
      "mid-century": `1940s–1970s`,
      vintage: `1980s–2000s`,
      modern: `2010s–Present`,
    };
  }, []);

  return (
    <div className={`w-full bg-transparent ${className}`}>
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap h-full">
        <span className="hidden lg:block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 shrink-0">
          Era:
        </span>

        <div className="flex items-center gap-5 h-full">
          {eraOptions.map((era) => {
            const eraKey = era.toLowerCase() as keyof typeof eraData;
            const years = eraData[eraKey];
            const isActive = activeEra === era || (!activeEra && era === "all");

            return (
              <div
                key={era}
                className="relative group flex items-center h-full"
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
                  className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all relative h-full flex items-center border-b-2 ${
                    isActive
                      ? "text-blue-600 border-blue-600"
                      : "text-zinc-900 border-transparent hover:text-zinc-800"
                  }`}
                >
                  {era}
                </Link>

                {years && (
                  <div className="hidden lg:block absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                    <div className="bg-zinc-800 text-white text-[8px] font-mono px-2 py-1 shadow-md uppercase">
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