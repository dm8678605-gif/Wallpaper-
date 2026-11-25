"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className={`flex items-center gap-2 text-sm text-[#8A7B6B] hover:text-[#30251F] transition-colors ${compact ? "" : "w-full px-2 py-2"}`}>
      <LogOut size={15} /> {compact ? "Logout" : "Sign out"}
    </button>
  );
}
