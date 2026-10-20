import Link from "next/link";
import pool from "../../../lib/db";
import { requireRole } from "../../../lib/auth";
import Topbar from "../../../components/admin/Topbar";
import { StatCard, StatusPendaftar, tableWrap, th, td } from "../../../components/ui";
import { tanggal } from "../../../lib/format";

export default async function AdminDashboard() {
  const session = await requireRole("admin");

  const [statRows] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(COALESCE(p.status, 'menunggu') = 'diterima') AS diterima,
            SUM(COALESCE(p.status, 'menunggu') = 'ditolak') AS ditolak,
            SUM(COALESCE(p.status, 'menunggu') = 'menunggu') AS menunggu
     FROM users u LEFT JOIN pendaftar p ON p.user_id = u.id
     WHERE u.role = 'calon_siswa'`
  );
  const stat = statRows[0];

  // 6 minggu terakhir (w = 0 berarti 7 hari terakhir)
  const [weekRows] = await pool.query(
    `SELECT FLOOR(DATEDIFF(CURDATE(), DATE(u.created_at)) / 7) AS w,
            COUNT(*) AS daftar,
            SUM(COALESCE(p.status, 'menunggu') = 'diterima') AS lolos
     FROM users u LEFT JOIN pendaftar p ON p.user_id = u.id
     WHERE u.role = 'calon_siswa' AND u.created_at >= DATE_SUB(CURDATE(), INTERVAL 42 DAY)
     GROUP BY w`
  );

  const [recent] = await pool.query(
    `SELECT u.id, u.nama, u.created_at, p.nisn, p.jurusan,
            COALESCE(p.status, 'menunggu') AS status
     FROM users u LEFT JOIN pendaftar p ON p.user_id = u.id
     WHERE u.role = 'calon_siswa'
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT 5`
  );

  const weeks = Array.from({ length: 6 }, (_, i) => {
    const w = 5 - i;
    const r = weekRows.find((x) => Number(x.w) === w);
    return {
      label: w === 0 ? "Minggu ini" : `${w} mgg lalu`,
      daftar: Number(r?.daftar ?? 0),
      lolos: Number(r?.lolos ?? 0),
    };
  });
  const max = Math.max(1, ...weeks.map((w) => w.daftar));
  const terbaru = recent[0];

  return (
    <>
      <Topbar
        title="Dashboard"
        nama={session.nama}
        search={{
          action: "/dashboard/admin/data-pendaftar",
          placeholder: "Cari data pendaftar...",
        }}
      />

      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Pendaftar" value={Number(stat.total)} />
          <StatCard label="Diterima" value={Number(stat.diterima ?? 0)} tone="text-emerald-300" />
          <StatCard label="Ditolak" value={Number(stat.ditolak ?? 0)} tone="text-red-300" />
          <StatCard label="Menunggu Verifikasi" value={Number(stat.menunggu ?? 0)} tone="text-amber-300" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl bg-[#3F7D66] p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Statistik Pendaftaran Mingguan</h2>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-red-400" />Daftar</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-emerald-300" />Diterima</span>
              </div>
            </div>
            <div className="mt-6 flex h-48 items-end gap-3">
              {weeks.map((w) => (
                <div key={w.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <div className="flex flex-1 items-end justify-center gap-1">
                    <div
                      title={`Daftar: ${w.daftar}`}
                      style={{ height: `${(w.daftar / max) * 100}%` }}
                      className="min-h-[3px] w-5 rounded-t bg-red-400"
                    />
                    <div
                      title={`Diterima: ${w.lolos}`}
                      style={{ height: `${(w.lolos / max) * 100}%` }}
                      className="min-h-[3px] w-5 rounded-t bg-emerald-300"
                    />
                  </div>
                  <span className="text-center text-[10px] text-white/70">{w.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-[#123223] p-6 text-white shadow-lg">
            <p className="text-xs font-semibold text-white/60">PENDAFTAR TERBARU</p>
            {terbaru ? (
              <>
                <p className="mt-3 text-2xl font-extrabold leading-tight">{terbaru.nama}</p>
                <p className="mt-1 text-sm text-white/70">
                  {terbaru.jurusan ?? "Jurusan belum diisi"}
                </p>
                <p className="mt-1 text-xs text-white/50">Mendaftar {tanggal(terbaru.created_at)}</p>
                <div className="mt-4"><StatusPendaftar value={terbaru.status} /></div>
                <Link
                  href={`/dashboard/admin/verifikasi?id=${terbaru.id}`}
                  className="mt-5 inline-block text-sm font-semibold text-emerald-300 hover:underline"
                >
                  Buka detail
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm text-white/60">Belum ada yang mendaftar.</p>
            )}
          </section>
        </div>

        <section className={tableWrap}>
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold">Pendaftar Terbaru</h2>
            <Link href="/dashboard/admin/data-pendaftar" className="text-xs font-semibold text-emerald-300 hover:underline">
              Lihat semua
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>No</th>
                <th className={th}>Nama</th>
                <th className={th}>NISN</th>
                <th className={th}>Jurusan</th>
                <th className={th}>Status</th>
                <th className={th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={6} className={`${td} text-center text-white/60`}>Belum ada pendaftar.</td></tr>
              )}
              {recent.map((r, i) => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className={td}>{i + 1}</td>
                  <td className={`${td} font-semibold`}>{r.nama}</td>
                  <td className={td}>{r.nisn ?? "-"}</td>
                  <td className={td}>{r.jurusan ?? "-"}</td>
                  <td className={td}><StatusPendaftar value={r.status} /></td>
                  <td className={td}>
                    <Link href={`/dashboard/admin/verifikasi?id=${r.id}`} className="text-xs font-semibold text-emerald-300 hover:underline">
                      Detail
                    </Link>
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
