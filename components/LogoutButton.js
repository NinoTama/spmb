"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-white/50 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#123223]"
    >
      Keluar
    </button>
  );
}
