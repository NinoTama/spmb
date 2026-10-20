import DashboardShell from "../../../components/DashboardShell";
import { requireRole } from "../../../lib/auth";

export default async function DashboardKepsek() {
  // Server memeriksa sesi dan role di sini. Role lain akan di-redirect.
  const session = await requireRole("kepsek");

  return (
    <DashboardShell
      session={session}
      roleLabel="Kepala Sekolah"
      items={[
        { title: "Laporan", desc: "Lihat laporan penerimaan siswa baru." },
        { title: "Rekap pendaftar", desc: "Ringkasan jumlah pendaftar per jurusan." },
        { title: "Hasil seleksi", desc: "Tinjau hasil seleksi sesuai kewenangan." },
      ]}
    />
  );
}
