"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { http } from "@/services/http";

export function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await http.post("/api/admin/logout");
        } finally {
          router.push("/admin/login");
          router.refresh();
        }
      }}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-red-50 hover:text-red-800"
    >
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  );
}
