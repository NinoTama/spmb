import Link from "next/link";
import AuthShell from "../../components/AuthShell";
import { Icon } from "../../components/Icons";

export default function LoginPage() {
  return (
    <AuthShell title="Pilih halaman masuk" subtitle="Pilih jenis akun untuk melanjutkan.">
      <div className="grid gap-3">
        {[
          { href: "/login/student", icon: "cap", title: "Calon Siswa", desc: "Masuk untuk melihat pendaftaran." },
          { href: "/login/admin", icon: "bag", title: "Admin", desc: "Masuk untuk mengelola pendaftaran." },
          { href: "/login/principal", icon: "shield", title: "Kepala Sekolah", desc: "Masuk untuk meninjau hasil seleksi." },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-16 items-center gap-3 rounded-xl border border-[#DFE6D4] p-3 transition hover:border-[#15803D] hover:bg-[#F4F7F0] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#E6ECE4] text-[#1E4A34]">
              <Icon name={item.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-[#123223]">{item.title}</span>
              <span className="mt-0.5 block text-xs text-[#526E5D]">{item.desc}</span>
            </span>
            <span aria-hidden="true" className="text-lg text-[#526E5D]">›</span>
          </Link>
        ))}
      </div>
      <p className="mt-5 text-center text-xs font-semibold text-[#526E5D]">
        Calon siswa belum punya akun?{" "}
        <Link href="/register" className="font-bold text-[#123223] underline underline-offset-2">
          Daftar
        </Link>
      </p>
    </AuthShell>
  );
}
