import Link from "next/link";
import { Alegreya_Sans } from "next/font/google";
import { Icon } from "./components/Icons";
import { SCHOOL_NAME } from "./lib/school";

const heading = Alegreya_Sans({ subsets: ["latin"], weight: ["500", "700", "800"] });

const roles = [
  {
    icon: "cap",
    title: "Siswa & Orang Tua",
    desc: "Mendaftar menjadi siswa baru di sekolah ini.",
    label: "Daftar Sekarang",
    href: "/register",
    loginHref: "/login/student",
  },
  {
    icon: "shield",
    title: "Kepala Sekolah",
    desc: "Meninjau dan menyetujui hasil akhir seleksi.",
    label: "Login",
    href: "/login/principal",
  },
  {
    icon: "bag",
    title: "Admin",
    desc: "Memverifikasi berkas dan mengelola data pendaftar.",
    label: "Login",
    href: "/login/admin",
  },
];

const steps = [
  { title: "Buat akun", desc: "Isi data diri dan pilih jurusan." },
  { title: "Lengkapi berkas", desc: "Unggah berkas yang diminta." },
  { title: "Verifikasi admin", desc: "Admin memeriksa berkas." },
  { title: "Persetujuan", desc: "Kepala sekolah menetapkan hasil." },
];

const navLink =
  "relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#546B41] text-white">
      {/* pola titik halus */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />

      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <a href="#" className="text-lg font-bold">
            {SCHOOL_NAME}
          </a>
          <nav className="hidden gap-6 text-sm font-semibold sm:flex">
            <a href="#" className={navLink}>Beranda</a>
            <a href="#masuk" className={navLink}>Masuk sebagai</a>
            <a href="#alur" className={navLink}>Alur Pendaftaran</a>
          </nav>
          <a
            href="#masuk"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold sm:hidden"
          >
            Masuk
          </a>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-14">
        <h1
          className={`${heading.className} max-w-2xl text-4xl font-bold leading-snug sm:text-5xl sm:leading-snug`}
        >
          Satu pintu masuk untuk seluruh proses penerimaan siswa baru
        </h1>
        <p className="mt-5 max-w-md leading-relaxed text-[#DFE6D4]">
          Daftar sebagai siswa, tinjau hasil sebagai kepala sekolah, atau kelola
          berkas sebagai admin — semua dalam satu sistem yang sama.
        </p>

        <section id="masuk" className="mt-16 scroll-mt-8">
          <h2 className="mb-3 text-xs font-bold tracking-wide">MASUK SEBAGAI</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
            {roles.map((r) => (
              <div
                key={r.title}
                className="group flex flex-col rounded-2xl bg-white p-6 text-[#1C1F1B] shadow-xl shadow-black/15 transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/25"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6ECE4] text-[#1E4A34] transition group-hover:bg-[#15803D] group-hover:text-white">
                  <Icon name={r.icon} className="h-5 w-5" />
                </span>
                <h3 className={`${heading.className} mt-6 text-base font-bold`}>
                  {r.title}
                </h3>
                <p className="mb-6 mt-2 flex-1 text-sm leading-snug text-[#6B7266]">
                  {r.desc}
                </p>
                <Link
                  href={r.href}
                  className="rounded-lg bg-[#2F8F4E] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#123223] focus:outline-none focus:ring-2 focus:ring-[#DFE6D4] focus:ring-offset-2 focus:ring-offset-white"
                >
                  {r.label}
                </Link>
                {r.loginHref && (
                  <Link
                    href={r.loginHref}
                    className="mt-2 rounded-lg border border-[#2F8F4E] py-2.5 text-center text-sm font-semibold text-[#1E4A34] transition hover:bg-[#E6ECE4] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    Sudah punya akun? Masuk
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="alur" className="mt-20 scroll-mt-8">
          <h2 className="mb-3 text-xs font-bold tracking-wide">ALUR PENDAFTARAN</h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-white/15 bg-white/5 p-4"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DFE6D4] text-xs font-bold text-[#123223]">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-bold">{s.title}</p>
                <p className="mt-1 text-xs text-[#DFE6D4]">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="relative border-t border-white/10 py-6 text-center text-xs text-[#DFE6D4]">
        © {new Date().getFullYear()} {SCHOOL_NAME}
      </footer>
    </div>
  );
}
