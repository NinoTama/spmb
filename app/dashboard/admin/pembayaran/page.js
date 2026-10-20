import pool from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import Topbar from "../../../../components/admin/Topbar";
import { StatCard, StatusBayar, tableWrap, th, td, btnGreen, btnRed, btnGhost } from "../../../../components/ui";
import { rupiah } from "../../../../lib/format";
import Link from "next/link";
import BuktiPembayaranModal from "../../../../components/admin/BuktiPembayaranModal";
import BatasPembayaranForm from "../../../../components/admin/BatasPembayaranForm";
import { ubahStatusBayar, ingatkan } from "../actions";

export default async function Pembayaran({ searchParams }) {
  const session = await requireRole("admin");
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const like = `%${q}%`;

  const [[pengaturan]] = await pool.query(
    `SELECT DATE_FORMAT(batas_pembayaran, '%Y-%m-%dT%H:%i') AS batas_input,
            DATE_FORMAT(batas_pembayaran, '%d %b %Y pukul %H:%i') AS batas_label,
            (batas_pembayaran IS NOT NULL AND NOW() > batas_pembayaran) AS sudah_lewat
     FROM pengaturan_pembayaran WHERE id = 1`
  );
  const [hitung] = await pool.query(
    `SELECT COALESCE(pay.status, 'belum_bayar') AS status, COUNT(*) AS jumlah
     FROM users u LEFT JOIN pembayaran pay ON pay.user_id = u.id
     WHERE u.role = 'calon_siswa'
     GROUP BY COALESCE(pay.status, 'belum_bayar')`
  );
  const jumlah = (s) => Number(hitung.find((h) => h.status === s)?.jumlah ?? 0);

  const [rows] = await pool.query(
    `SELECT u.id, u.nama, p.nisn,
           COALESCE(pay.nominal, 350000) AS nominal, pay.metode, pay.bukti_file, pay.bukti_mime,
            COALESCE(pay.status, 'belum_bayar') AS status
     FROM users u
     LEFT JOIN pendaftar p ON p.user_id = u.id
     LEFT JOIN pembayaran pay ON pay.user_id = u.id
     WHERE u.role = 'calon_siswa' AND (u.nama LIKE ? OR p.nisn LIKE ?)
     ORDER BY FIELD(COALESCE(pay.status, 'belum_bayar'), 'menunggu_konfirmasi', 'belum_bayar', 'lunas'),
              u.created_at DESC`,
    [like, like]
  );

  return (
    <>
      <Topbar
        title="Verifikasi Pembayaran"
        nama={session.nama}
        search={{
          action: "/dashboard/admin/pembayaran",
          placeholder: "Cari nama atau NISN...",
          value: q,
        }}
      />

      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Lunas" value={jumlah("lunas")} tone="text-emerald-300" />
          <StatCard label="Menunggu konfirmasi" value={jumlah("menunggu_konfirmasi")} tone="text-amber-300" />
          <StatCard label="Belum bayar" value={jumlah("belum_bayar")} />
        </div>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p>
            <strong>Tahap 1:</strong> konfirmasi bukti pembayaran. Jika diterima dan status menjadi
            Lunas, siswa bisa mengerjakan soal tes. Kelulusan siswa ditentukan di tahap berikutnya.
          </p>
          <Link
            href="/dashboard/admin/verifikasi"
            className="shrink-0 font-bold underline underline-offset-2"
          >
            Ke verifikasi kelulusan
          </Link>
        </section>

        <BatasPembayaranForm initialValue={pengaturan?.batas_input ?? ""} />
        {pengaturan?.batas_label && (
          <p className={`text-sm ${pengaturan.sudah_lewat ? "text-red-700" : "text-[#526E5D]"}`}>
            Tenggat saat ini: <strong>{pengaturan.batas_label}</strong>
            {pengaturan.sudah_lewat ? " (sudah lewat)." : "."}
          </p>
        )}

        <section className={tableWrap}>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>No</th>
                <th className={th}>Nama</th>
                <th className={th}>Nominal</th>
                <th className={th}>Metode</th>
                <th className={th}>Status</th>
                <th className={th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className={`${td} text-center text-white/60`}>Tidak ada data.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className={td}>{i + 1}</td>
                  <td className={`${td} font-semibold`}>
                    {r.nama}
                    <span className="block text-xs font-normal text-white/50">{r.nisn ?? ""}</span>
                  </td>
                  <td className={td}>{rupiah(r.nominal)}</td>
                  <td className={td}>{r.metode ?? "—"}</td>
                  <td className={td}><StatusBayar value={r.status} /></td>
                  <td className={td}>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.bukti_file && (
                        <BuktiPembayaranModal userId={r.id} nama={r.nama} mime={r.bukti_mime} />
                      )}
                      {r.status === "menunggu_konfirmasi" && (
                        <>
                          <form action={ubahStatusBayar}>
                            <input type="hidden" name="userId" value={r.id} />
                            <input type="hidden" name="aksi" value="terima" />
                            <button className={btnGreen}>Terima Pembayaran</button>
                          </form>
                          <form action={ubahStatusBayar}>
                            <input type="hidden" name="userId" value={r.id} />
                            <input type="hidden" name="aksi" value="tolak" />
                            <button className={btnRed}>Tolak Bukti</button>
                          </form>
                        </>
                      )}
                      {r.status === "belum_bayar" && (
                        <form action={ingatkan}>
                          <input type="hidden" name="userId" value={r.id} />
                          <button className={btnGhost}>Ingatkan</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
