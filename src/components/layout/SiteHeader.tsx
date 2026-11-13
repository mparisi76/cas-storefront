"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, ChevronDown, LayoutDashboard, ShieldCheck, Settings, LogOut, LogIn } from "lucide-react";
import FontSizeControls from "@/components/ui/FontSizeControls";
import { logoutAction } from "@/app/actions/auth/logout";
import type { HeaderUser } from "@/lib/header-user";
import type { MeResponse } from "@/app/api/me/route";

const NAV = [
  { name: "Catalog", href: "/inventory" },
  { name: "About", href: "/about" },
];

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

function Badge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none tracking-normal">
      {count}
    </span>
  );
}

function Avatar({ user, size = 36 }: { user: HeaderUser; size?: number }) {
  return (
    <span
      className="relative rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        initialsOf(user.name)
      )}
    </span>
  );
}

/**
 * The one header used on every page.
 * - `user` passed (portal, server-rendered): shown immediately.
 * - `user` omitted (storefront, cached pages): fetched from /api/me after load.
 */
export default function SiteHeader({ user: initialUser }: { user?: HeaderUser | null }) {
  const pathname = usePathname();
  const router = useRouter();

  // Portal passes the user from the server; storefront pages fetch it.
  const [fetchedUser, setFetchedUser] = useState<HeaderUser | null>(null);
  const user = initialUser !== undefined ? initialUser : fetchedUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Storefront pages don't know who's logged in at render time; ask once.
  useEffect(() => {
    if (initialUser !== undefined) return;
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : { user: null }))
      .then((d) => {
        if (!cancelled) setFetchedUser(d.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  const closeAll = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInput.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    setQuery("");
    router.push(`/inventory?search=${encodeURIComponent(q)}&page=1`);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const accountLinks = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: 0 },
        ...(user.isAdmin
          ? [{ name: "Admin Dashboard", href: "/dashboard/admin", icon: ShieldCheck, badge: user.pendingVendors }]
          : []),
        { name: "Settings", href: "/dashboard/settings", icon: Settings, badge: 0 },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F9F8F6] border-b border-zinc-200">
      {/* 3-column grid: left and right take equal space so the brand is always centered */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20 px-4 md:px-10">
        {/* LEFT: desktop nav / mobile menu button */}
        <div className="flex items-center">
          <button
            className="lg:hidden p-2 -ml-2 text-zinc-600"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-label font-black uppercase tracking-[0.3em] transition-colors ${
                  isActive(item.href) ? "text-zinc-900" : "text-zinc-500 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER: brand */}
        <Link href="/" onClick={closeAll} className="group text-center px-2">
          <span className="block text-xl md:text-2xl font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-600 leading-none">
            Catskill
          </span>
          <span className="block text-detail uppercase tracking-[0.3em] md:tracking-[0.6em] text-zinc-600 font-medium mt-1 group-hover:text-blue-600 transition-colors whitespace-nowrap">
            Architectural Salvage
          </span>
          {/* Tagline: broadens the brand beyond salvage without changing the business name */}
          <span className="hidden md:block text-[9px] uppercase tracking-[0.35em] text-zinc-500 mt-1.5 whitespace-nowrap">
            Antiques · Vintage · Salvage
          </span>
        </Link>

        {/* RIGHT: search, text size, account */}
        <div className="flex items-center justify-end gap-1 md:gap-3">
          <button
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMenuOpen(false);
            }}
            aria-label="Search"
            className={`p-2 transition-colors ${searchOpen ? "text-blue-600" : "text-zinc-600 hover:text-zinc-900"}`}
          >
            {searchOpen ? <X size={18} strokeWidth={2} /> : <Search size={18} strokeWidth={1.5} />}
          </button>

          <div className="hidden md:block">
            <FontSizeControls />
          </div>

          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-3 pl-1 group"
                aria-label="Account menu"
                aria-expanded={accountOpen}
              >
                <span className="hidden xl:flex flex-col items-end text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1 font-bold">{user.role}</span>
                </span>
                <span className="relative">
                  <Avatar user={user} />
                  {user.isAdmin && user.pendingVendors > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {user.pendingVendors}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={12}
                  className={`hidden md:block text-zinc-500 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white border border-zinc-200 shadow-xl z-50 py-2">
                  <div className="px-4 py-3 border-b border-zinc-100 mb-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black mb-1">Signed in as</p>
                    <p className="text-[11px] font-medium text-zinc-900 truncate">{user.email}</p>
                  </div>
                  {accountLinks.map(({ name, href, icon: Icon, badge }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeAll}
                      className={`flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest transition-colors hover:bg-zinc-50 ${
                        pathname === href ? "text-zinc-900 font-bold" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      <Icon size={14} strokeWidth={2.5} /> {name}
                      <Badge count={badge} />
                    </Link>
                  ))}
                  <div className="h-px bg-zinc-100 my-1" />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors font-bold"
                    >
                      <LogOut size={14} strokeWidth={2.5} /> Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:flex items-center gap-2 text-label font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <LogIn size={14} /> Vendor Login
            </Link>
          )}
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      <div
        className={`absolute top-full left-0 w-full bg-white border-b border-zinc-200 transition-all duration-300 ease-in-out overflow-hidden shadow-xl z-50 ${
          searchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <form onSubmit={submitSearch} className="px-6 md:px-10 py-6 max-w-7xl mx-auto flex items-center gap-4 md:gap-6">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            ref={searchInput}
            type="text"
            placeholder="SEARCH COLLECTIONS"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-label md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-800 placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="hidden md:block text-label font-black uppercase tracking-widest text-blue-600 hover:text-zinc-900 transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-[#F9F8F6] z-50 p-8 overflow-y-auto flex flex-col">
          <nav className="flex flex-col gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAll}
                className="text-3xl font-bold uppercase tracking-tighter text-zinc-700 italic border-b border-zinc-200 pb-4"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-8 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-zinc-200">
                  <Avatar user={user} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>
                {accountLinks.map(({ name, href, icon: Icon, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeAll}
                    className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.2em] text-zinc-700"
                  >
                    <Icon size={16} /> {name}
                    <Badge count={badge} />
                  </Link>
                ))}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.2em] text-red-600 font-bold"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={closeAll} className="flex items-center gap-3 py-3 text-[12px] uppercase tracking-[0.2em] text-zinc-700">
                <LogIn size={16} /> Vendor Login
              </Link>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="text-label font-black uppercase tracking-[0.3em] text-zinc-500">Text Size</span>
            <FontSizeControls />
          </div>

          <p className="mt-auto pt-10 text-label font-black uppercase tracking-[0.4em] text-zinc-500">
            © {new Date().getFullYear()} Catskill Architectural Salvage
          </p>
        </div>
      )}
    </header>
  );
}
