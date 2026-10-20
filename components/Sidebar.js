"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icons";

export default function Sidebar({ school, base, items }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  function isActive(item) {
    return pathname === item.href || (item.href !== base && pathname.startsWith(item.href));
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-[#1E4A34] text-white md:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
          <div className="min-w-0 border-l-[3px] border-red-500 pl-2">
            <p className="text-xs font-bold tracking-wide">SPMB SYSTEM</p>
            <p className="truncate text-[10px] text-white/60">{school}</p>
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute left-0 right-0 top-full border-t border-white/10 bg-[#1E4A34] p-3 shadow-xl">
            <div className="flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(item) ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive(item)
                      ? "bg-white/20 font-semibold text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-300 transition hover:bg-white/10"
              >
                <Icon name="logout" className="h-4 w-4 shrink-0" />
                Keluar
              </button>
            </div>
          </nav>
        )}
      </div>

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-[#1E4A34] p-4 text-white md:flex">
        <div className="mb-6 border-l-[3px] border-red-500 pl-2">
          <p className="text-xs font-bold tracking-wide">SPMB SYSTEM</p>
          <p className="text-[10px] text-white/60">{school}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive(item)
                  ? "bg-white/20 font-semibold text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-white/10"
        >
          <Icon name="logout" className="h-4 w-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </aside>
    </>
  );
}
