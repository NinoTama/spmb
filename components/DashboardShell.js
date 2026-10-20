import LogoutButton from "./LogoutButton";
import { SCHOOL_NAME } from "../lib/school";

export default function DashboardShell({ session, roleLabel, items }) {
  return (
    <div className="min-h-screen bg-[#F4F7F0] text-[#123223]">
      <header className="bg-[#546B41] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-bold">{SCHOOL_NAME}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <span className="rounded-full bg-[#DFE6D4] px-3 py-1 text-xs font-bold">
          {roleLabel}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold">Halo, {session.nama}</h1>
        <p className="mt-1 text-[#526E5D]">Selamat datang di dashboard SPMB.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#DFE6D4] bg-white p-6 shadow-sm"
            >
              <h2 className="font-bold">{item.title}</h2>
              <p className="mt-1 text-sm text-[#6B7266]">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
