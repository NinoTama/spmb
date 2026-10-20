import Sidebar from "../../../components/Sidebar";
import { SCHOOL_NAME } from "../../../lib/school";

const items = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "grid" },
  { href: "/dashboard/admin/data-pendaftar", label: "Data Pendaftar", icon: "database" },
  { href: "/dashboard/admin/verifikasi", label: "Verifikasi Kelulusan", icon: "verify" },
  { href: "/dashboard/admin/soal-tes", label: "Soal Tes", icon: "book" },
  { href: "/dashboard/admin/pembayaran", label: "Verifikasi Pembayaran", icon: "wallet" },
  { href: "/dashboard/admin/akun-pengelola", label: "Akun Pengelola", icon: "shield" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#EDEEE8] text-[#123223] md:flex-row">
      <Sidebar school={SCHOOL_NAME} base="/dashboard/admin" items={items} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
