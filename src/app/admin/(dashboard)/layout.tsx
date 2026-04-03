import Link from "next/link";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Receipt,
  Images,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/layout/AdminLogoutButton";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/settings", label: "Banners", icon: Images },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-neutral-50 font-body text-neutral-900">
      <div className="flex flex-col md:flex-row">
        <aside className="border-b border-neutral-200 bg-white md:min-h-dvh md:w-56 md:border-b-0 md:border-r">
          <div className="p-4">
            <Link
              href="/"
              className="text-sm font-bold text-[#e60000] hover:underline"
            >
              ← Back to menu
            </Link>
            <p className="mt-3 font-logo text-xl text-[#e60000]">Admin</p>
            <p className="text-xs text-neutral-500">Ad Pizza Hub</p>
          </div>
          <nav className="flex flex-row gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#fdf6e8] hover:text-[#b91c1c]"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            ))}
            <AdminLogoutButton />
          </nav>
        </aside>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
