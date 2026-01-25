// components/dashboard/DashboardHeader.tsx
"use client";

import { useState } from "react"; // Added for mobile state
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react"; // Assuming you use lucide-react, otherwise use SVG strings

const navItems = [
  { name: "Catalog", href: "/inventory" },
  // { name: "Sales", href: "/dashboard/sales" },
  // { name: "Settings", href: "/dashboard/settings" },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-100 bg-white sticky top-0 z-50">
      <div className="w-full px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Left Section: Branding */}
        <div className="flex items-center gap-4 lg:gap-10 shrink-0">
          <Link href="/" className="group flex flex-col items-start shrink-0">
            <h1 className="text-base md:text-xl font-bold uppercase tracking-[0.4em] text-zinc-900 leading-none">
              Catskill
            </h1>
            <p className="text-[7px] md:text-[8px] uppercase tracking-[0.5em] text-zinc-500 font-medium mt-1">
              Architectural Salvage
            </p>
          </Link>

          <div className="hidden sm:block h-8 w-px bg-zinc-200 shrink-0" />

          <Link href="/dashboard" className="shrink-0">
            <p className="text-[12px] md:text-[14px] lg:text-[16px] uppercase tracking-[0.2em] text-zinc-600 font-medium">
              VENDOR PORTAL
            </p>
          </Link>
        </div>

        {/* Right Section: Desktop Nav + Profile */}
        <div className="flex items-center gap-4 lg:gap-10">
          {/* Desktop Nav Section */}
					<nav className="hidden md:flex items-center gap-4 lg:gap-8 border-r border-zinc-100 pr-4 lg:pr-10">
						{navItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className={`text-[10px] lg:text-[11px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap leading-none py-1 ${
										isActive ? "text-zinc-900 font-bold" : "text-zinc-500 hover:text-zinc-900"
									}`}
								>
									{item.name}
								</Link>
							);
						})}

						{/* Added leading-none and py-1 to match the Links exactly */}
						<form action={logoutAction} className="flex items-center">
							<button 
								type="submit" 
								className="text-[10px] lg:text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600 transition-colors whitespace-nowrap leading-none py-1"
							>
								Logout
							</button>
						</form>
					</nav>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-medium text-zinc-600 shrink-0">
            JD
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-6 space-y-6 absolute w-full shadow-xl">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-[11px] uppercase tracking-[0.2em] ${
                  pathname === item.href ? "text-zinc-900 font-bold" : "text-zinc-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <form action={logoutAction}>
              <button type="submit" className="text-[11px] uppercase tracking-[0.2em] text-red-600 font-bold">
                Logout
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}