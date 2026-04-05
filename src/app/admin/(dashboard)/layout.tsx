"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Receipt,
  Images,
  PanelTop,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/layout/AdminLogoutButton";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/navbar", label: "Navbar", icon: PanelTop },
  { href: "/admin/settings", label: "Site", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-neutral-50 font-body text-neutral-900">
      <div className="flex flex-col md:flex-row">
        <aside className="border-b border-neutral-200 bg-white md:min-h-dvh md:w-64 md:border-b-0 md:border-r md:shadow-sm">
          {/* Header */}
          <div className="border-b border-neutral-100 p-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#e60000] hover:opacity-80 transition"
            >
              ← Back to Menu
            </Link>
            <p className="mt-4 font-logo text-2xl font-extrabold text-[#e60000]">Admin</p>
            <p className="mt-1 text-xs font-medium text-neutral-500">Ad Pizza Hub</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-row gap-2 overflow-x-auto px-3 py-3 md:flex-col md:space-y-1 md:px-3 md:py-4">
            {nav.map((item) => {
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" || pathname === "/admin/(dashboard)"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap md:whitespace-normal ${
                    isActive
                      ? "bg-linear-to-r from-[#e60000]/10 to-transparent text-[#e60000] shadow-sm border-l-4 border-[#e60000]"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="hidden flex-1 md:block" />

          {/* Logout Button */}
          <div className="border-t border-neutral-100 p-3 md:border-t md:p-4">
            <AdminLogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
