import Link from "next/link";
import { SCHOOL_NAME } from "../lib/school";

export default function AuthShell({ title, subtitle, wide = false, children }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-[#546B41] px-3 py-6 sm:px-4 sm:py-10">
      {/* pola titik halus */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />

      <Link
        href="/"
        className="relative mb-5 text-sm font-bold text-white/90 transition hover:text-white"
      >
        {SCHOOL_NAME}
      </Link>

      <div
        className={`relative w-full ${wide ? "max-w-3xl" : "max-w-xl"} rounded-2xl bg-white px-5 py-7 shadow-2xl shadow-black/20 ring-1 ring-black/5 sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-16`}
      >
        <div className="mb-2 border-l-[3px] border-[#123223] pl-2">
          <span className="text-[10px] font-bold tracking-wide text-[#123223]">
            SPMB SCHOOL ADMISSION
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-[#123223] sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#526E5D]">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>

      <Link
        href="/"
        className="relative mt-5 text-xs font-semibold text-[#DFE6D4] underline-offset-4 transition hover:text-white hover:underline"
      >
        Kembali ke beranda
      </Link>
    </main>
  );
}
