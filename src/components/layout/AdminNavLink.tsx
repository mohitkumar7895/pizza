"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface AdminNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AdminNavLink({ href, label, icon: Icon }: AdminNavLinkProps) {
  const pathname = usePathname();
  
  // Check if current path matches the nav item
  const isActive = href === "/admin" 
    ? pathname === "/admin" || pathname === "/admin/(dashboard)"
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap md:whitespace-normal ${
        isActive
          ? "bg-linear-to-r from-[#e60000]/10 to-transparent text-[#e60000] shadow-sm border-l-4 border-[#e60000] md:border-l-4"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
