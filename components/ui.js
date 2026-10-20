import { STATUS_PENDAFTAR, STATUS_BAYAR } from "../lib/format";

const DARK = {
  green: "bg-emerald-400/15 text-emerald-300",
  amber: "bg-amber-400/15 text-amber-300",
  red: "bg-red-400/15 text-red-300",
  gray: "bg-white/10 text-white/70",
  blue: "bg-sky-400/15 text-sky-300",
};
const LIGHT = {
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-slate-200 text-slate-700",
  blue: "bg-sky-100 text-sky-800",
};

export function Badge({ tone = "gray", light = false, children }) {
  const map = light ? LIGHT : DARK;
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusPendaftar({ value, light = false }) {
  const [label, tone] = STATUS_PENDAFTAR[value] ?? STATUS_PENDAFTAR.menunggu;
  return <Badge tone={tone} light={light}>{label}</Badge>;
}

export function StatusBayar({ value, light = false }) {
  const [label, tone] = STATUS_BAYAR[value] ?? STATUS_BAYAR.belum_bayar;
  return <Badge tone={tone} light={light}>{label}</Badge>;
}

export function StatCard({ label, value, tone = "text-white/70" }) {
  return (
    <div className="rounded-2xl bg-[#3F7D66] p-5 text-white shadow-lg">
      <p className={`text-xs font-semibold ${tone}`}>{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

// kelas tabel gelap bergaya desain Figma
export const tableWrap = "overflow-x-auto rounded-2xl bg-[#1E4A34] text-white shadow-xl";
export const th = "bg-[#123223] px-5 py-3 text-left text-xs font-bold uppercase tracking-wide";
export const td = "px-5 py-3.5 text-sm";

export const btnGreen =
  "rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-400";
export const btnRed =
  "rounded-md bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-400";
export const btnGhost =
  "inline-block rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10";
