// components/dashboard/DashboardHeader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Settings, LogOut, ChevronDown } from "lucide-react";

const navItems = [
  { name: "Catalog", href: "/inventory" },
  // { name: "Sales", href: "/dashboard/sales" },
];

interface UserProps {
  name?: string;
  email?: string;
  role?: string;
}

export function DashboardHeader({ user }: { user?: UserProps }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to get initials (e.g., "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = user?.name ? getInitials(user.name) : "??";

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

        {/* Right Section: Navigation & Account */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8 border-r border-zinc-100 pr-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-[10px] lg:text-[11px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap leading-none py-1 ${
                    isActive
                      ? "text-zinc-900 font-bold"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Account Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 group outline-none"
            >
              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 leading-none">
                  {user?.name || "Anonymous Archivist"}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-zinc-400 mt-1 font-bold">
                  {user?.role || "Owner"}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0 group-hover:bg-zinc-800 transition-colors shadow-sm relative">
                {initials}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-100">
                  <ChevronDown
                    size={10}
                    className={`text-zinc-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </button>

            {/* Account Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-zinc-100 shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-zinc-50 mb-2">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-1">
                    Authenticated As
                  </p>
                  <p className="text-[11px] font-medium text-zinc-900 truncate">
                    {user?.email || "user@catskill.com"}
                  </p>
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  <Settings size={14} strokeWidth={2.5} /> Settings
                </Link>

                <div className="h-px bg-zinc-50 my-1" />

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors font-bold"
                  >
                    <LogOut size={14} strokeWidth={2.5} /> Logout
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-zinc-600 hover:bg-zinc-50 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-8 space-y-8 absolute w-full shadow-2xl animate-in slide-in-from-top-full duration-300 z-40">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-[12px] uppercase tracking-[0.3em] ${
                  pathname === item.href
                    ? "text-zinc-900 font-black"
                    : "text-zinc-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-zinc-100" />
            <Link
              href="/dashboard/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[12px] uppercase tracking-[0.3em] text-zinc-500"
            >
              Account Settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[12px] uppercase tracking-[0.3em] text-red-600 font-black"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
