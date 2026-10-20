import Link from "next/link";
import pool from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import Topbar from "../../../../components/admin/Topbar";
import EditSiswaModal from "../../../../components/admin/EditSiswaModal";
import { StatusPendaftar, tableWrap, th, td } from "../../../../components/ui";
import { tanggal } from "../../../../lib/format";
import { JURUSAN } from "../../../../lib/school";

const PER_PAGE = 8;

export default async function DataPendaftar({ searchParams }) {
  const session = await requireRole("admin");
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  const like = `%${q}%`;
  const where = `u.role = 'calon_siswa'
    AND (u.nama LIKE ? OR p.nisn LIKE ? OR p.jurusan LIKE ?)`;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM users u
     LEFT JOIN pendaftar p ON p.user_id = u.id WHERE ${where}`,
    [like, like, like]
  );
  const total = Number(countRows[0].total);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, pages);

  const [rows] = await pool.query(
    `SELECT u.id, u.nama, u.email, u.created_at, p.nisn, p.jurusan, p.alamat,
            DATE_FORMAT(p.tanggal_lahir, '%Y-%m-%d') AS tanggal_lahir, p.no_hp,
            COALESCE(p.status, 'menunggu') AS status
     FROM users u LEFT JOIN pendaftar p ON p.user_id = u.id
     WHERE ${where}
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT ? OFFSET ?`,
    [like, like, like, PER_PAGE, (current - 1) * PER_PAGE]
  );

  const href = (n) => `?q=${encodeURIComponent(q)}&page=${n}`;

  return (
    <>
      <Topbar
        title="Data Pendaftar"
        nama={session.nama}
        search={{
          action: "/dashboard/admin/data-pendaftar",
          placeholder: "Cari nama, NISN, atau jurusan...",
          value: q,
        }}
      />

      <main className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-[#526E5D]">{total} pendaftar ditemukan</p>

        <section className={tableWrap}>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>No</th>
                <th className={th}>Nama Lengkap</th>
                <th className={th}>NISN</th>
                <th className={th}>Jurusan</th>
                <th className={th}>Tanggal Daftar</th>
                <th className={th}>Status</th>
                <th className={th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className={`${td} text-center text-white/60`}>Tidak ada data.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className={td}>{String((current - 1) * PER_PAGE + i + 1).padStart(2, "0")}</td>
                  <td className={`${td} font-semibold`}>{r.nama}</td>
                  <td className={td}>{r.nisn ?? "-"}</td>
                  <td className={td}>{r.jurusan ?? "-"}</td>
                  <td className={td}>{tanggal(r.created_at)}</td>
                  <td className={td}><StatusPendaftar value={r.status} /></td>
                  <td className={td}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/dashboard/admin/verifikasi?id=${r.id}`} className="text-xs font-semibold text-emerald-300 hover:underline">
                        Lihat Detail
                      </Link>
                      <EditSiswaModal
                        siswa={r}
                        jurusanOptions={JURUSAN.map((jurusan) => jurusan.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {pages > 1 && (
          <nav className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={href(n)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
                  n === current ? "bg-[#1E4A34] text-white" : "bg-white text-[#123223] hover:bg-[#DFE6D4]"
                }`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </main>
    </>
  );
}
