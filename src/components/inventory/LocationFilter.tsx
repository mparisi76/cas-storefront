"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import type { LocationOption } from "@/services/(public)/artifacts";

/** Builds the catalog URL with a new location, keeping every other filter. */
function useSetLocation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (state: string | null, city: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (state) params.set("state", state);
    else params.delete("state");
    if (state && city) params.set("city", city);
    else params.delete("city");
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  };
}

/** Desktop sidebar: states with counts, expandable to towns. */
export function LocationFilter({ locations }: { locations: LocationOption[] }) {
  const searchParams = useSearchParams();
  const activeState = (searchParams.get("state") || "").toUpperCase();
  const activeCity = (searchParams.get("city") || "").toLowerCase();
  const setLocation = useSetLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    activeState ? { [activeState]: true } : {},
  );

  if (locations.length === 0) {
    return <p className="text-detail uppercase tracking-widest text-zinc-500">No locations yet</p>;
  }

  return (
    <nav className="space-y-0.5">
      <button
        onClick={() => setLocation(null, null)}
        className={`flex w-full mb-4 text-detail uppercase tracking-widest transition-colors ${
          !activeState ? "text-blue-600 font-black" : "text-zinc-500 hover:text-zinc-900"
        }`}
      >
        All Locations
      </button>

      {locations.map((loc) => {
        const isOpen = expanded[loc.state];
        const stateActive = activeState === loc.state && !activeCity;
        return (
          <div key={loc.state} className="mb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setLocation(loc.state, null);
                  setExpanded((p) => ({ ...p, [loc.state]: true }));
                }}
                className={`flex items-center gap-2 text-detail uppercase tracking-widest font-black text-left transition-colors ${
                  stateActive ? "text-blue-600" : "text-zinc-800 hover:text-blue-600"
                }`}
              >
                <MapPin size={11} className="shrink-0" />
                {loc.state}
                <span className="text-tiny font-medium text-zinc-500">({loc.count})</span>
              </button>
              {loc.cities.length > 0 && (
                <button
                  onClick={() => setExpanded((p) => ({ ...p, [loc.state]: !p[loc.state] }))}
                  className="p-1 hover:bg-zinc-100 rounded transition-colors text-zinc-500"
                  aria-label={isOpen ? `Hide towns in ${loc.state}` : `Show towns in ${loc.state}`}
                >
                  <ChevronRight size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>

            {isOpen && loc.cities.length > 0 && (
              <div className="flex flex-col gap-2 mt-3 mb-2 pl-3 border-l border-zinc-200">
                {loc.cities.map((c) => {
                  const active = activeState === loc.state && activeCity === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      onClick={() => setLocation(loc.state, c.name)}
                      className={`flex justify-between items-center w-full text-left text-detail uppercase tracking-wider transition-colors ${
                        active ? "text-blue-600 font-black" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="font-mono text-tiny">[{c.count}]</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/** Phones: one compact dropdown with states and towns. */
export function LocationSelect({ locations }: { locations: LocationOption[] }) {
  const searchParams = useSearchParams();
  const setLocation = useSetLocation();
  if (locations.length === 0) return null;

  const state = (searchParams.get("state") || "").toUpperCase();
  const city = searchParams.get("city") || "";
  const value = state ? (city ? `${state}|${city}` : state) : "";

  return (
    <label className="flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2">
      <MapPin size={12} className={state ? "text-blue-600" : "text-zinc-500"} />
      <span className="sr-only">Location</span>
      <select
        value={value}
        onChange={(e) => {
          const [s, c] = e.target.value.split("|");
          setLocation(s || null, c || null);
        }}
        className="flex-1 min-w-0 bg-transparent text-detail font-black uppercase tracking-widest text-zinc-800 outline-none"
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <optgroup key={loc.state} label={`${loc.state} (${loc.count})`}>
            <option value={loc.state}>All of {loc.state}</option>
            {loc.cities.map((c) => (
              <option key={c.name} value={`${loc.state}|${c.name}`}>
                {c.name}, {loc.state} ({c.count})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
