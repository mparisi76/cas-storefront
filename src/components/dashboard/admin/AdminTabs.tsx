"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminTabs({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const tabs = [
    { name: "Approvals", href: "/dashboard/admin", badge: pendingCount },
    { name: "Vendors", href: "/dashboard/admin/vendors" },
    { name: "Sales", href: "/dashboard/admin/sales" },
  ];

  return (
    <nav className="flex gap-8 border-b border-zinc-100">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`relative -mb-px pb-4 text-[11px] uppercase tracking-[0.2em] transition-colors ${
              active
                ? "text-zinc-900 font-bold border-b-2 border-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {t.name}
            {!!t.badge && (
              <span className="ml-2 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold leading-none tracking-normal">
                {t.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
