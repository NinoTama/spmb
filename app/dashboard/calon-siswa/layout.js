import Sidebar from "../../../components/Sidebar";
import { SCHOOL_NAME } from "../../../lib/school";

const items = [
  { href: "/dashboard/calon-siswa", label: "Beranda", icon: "home" },
  { href: "/dashboard/calon-siswa/berkas", label: "Berkas", icon: "file" },
  { href: "/dashboard/calon-siswa/tes", label: "Kerjakan Tes", icon: "book" },
  { href: "/dashboard/calon-siswa/hasil", label: "Hasil / Pengumuman", icon: "verify" },
  { href: "/dashboard/calon-siswa/profil", label: "Profil", icon: "user" },
  { href: "/dashboard/calon-siswa/pembayaran", label: "Pembayaran", icon: "wallet" },
];

export default function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#E9EAE7] text-[#123223] md:flex-row">
      <Sidebar school={SCHOOL_NAME} base="/dashboard/calon-siswa" items={items} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
