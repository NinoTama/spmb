import Link from "next/link";
import pool from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import Topbar from "../../../../components/admin/Topbar";
import { StatusPendaftar, tableWrap, th, td, btnGreen, btnRed, btnGhost } from "../../../../components/ui";
import { JENIS_BERKAS, tanggal } from "../../../../lib/format";
import { ubahStatusPendaftar } from "../actions";

export default async function Verifikasi({ searchParams }) {
  const session = await requireRole("admin");
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const selectedId = Number.parseInt(String(sp.id ?? ""), 10) || null;
  const berkasParam = Number.parseInt(String(sp.berkas ?? ""), 10) || null;
  const like = `%${q}%`;

  const [list] = await pool.query(
    `SELECT u.id, u.nama, p.nisn, p.jurusan
     FROM users u LEFT JOIN pendaftar p ON p.user_id = u.id
     WHERE u.role = 'calon_siswa' AND (u.nama LIKE ? OR p.nisn LIKE ?)
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT 20`,
    [like, like]
  );

  let detail = null;
  let berkas = [];
  if (selectedId) {
    const [rows] = await pool.query(
      `SELECT u.id, u.nama, u.email, p.nisn, p.alamat, p.tanggal_lahir, p.jurusan, p.no_hp,
              COALESCE(p.status, 'menunggu') AS status
       FROM users u LEFT JOIN pendaftar p ON p.user_id = u.id
       WHERE u.id = ? AND u.role = 'calon_siswa'`,
      [selectedId]
    );
    detail = rows[0] ?? null;
    if (detail) {
      const [b] = await pool.query(
        "SELECT id, jenis, nama_asli, mime FROM berkas WHERE user_id = ?",
        [selectedId]
      );
      berkas = b;
    }
  }

  const aktif = berkas.find((b) => b.id === berkasParam) ?? berkas[0] ?? null;

  return (
    <>
      <Topbar
        title="Verifikasi Kelulusan"
        nama={session.nama}
        search={{
          action: "/dashboard/admin/verifikasi",
          placeholder: "Cari nama atau NISN...",
          value: q,
        }}
      />

      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p>
            <strong>Tahap 2:</strong> tentukan hasil seleksi siswa. Status diterima berarti lulus/masuk;
            status ini berbeda dari verifikasi pembayaran untuk membuka tes.
          </p>
          <Link
            href="/dashboard/admin/pembayaran"
            className="shrink-0 font-bold underline underline-offset-2"
          >
            Ke verifikasi pembayaran
          </Link>
        </section>

        <section className={`${tableWrap} max-h-80 overflow-y-auto`}>
          <table className="w-full">
            <thead className="sticky top-0">
              <tr>
                <th className={th}>No</th>
                <th className={th}>Nama</th>
                <th className={th}>Jurusan</th>
                <th className={th}>NISN</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr><td colSpan={4} className={`${td} text-center text-white/60`}>Tidak ada pendaftar.</td></tr>
              )}
              {list.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-white/10 hover:bg-white/5 ${r.id === selectedId ? "bg-white/15" : ""}`}
                >
                  <td className={td}>{i + 1}</td>
                  <td className={`${td} font-semibold`}>
                    <Link href={`?id=${r.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="hover:underline">
                      {r.nama}
                    </Link>
                  </td>
                  <td className={td}>{r.jurusan ?? "-"}</td>
                  <td className={td}>{r.nisn ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {!selectedId && (
          <p className="text-sm text-[#526E5D]">Klik nama pendaftar untuk memeriksa berkasnya.</p>
        )}
        {selectedId && !detail && <p className="text-sm text-red-700">Pendaftar tidak ditemukan.</p>}

        {detail && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">{detail.nama}</h2>
                    <p className="text-sm text-[#526E5D]">{detail.email}</p>
                  </div>
                  <StatusPendaftar value={detail.status} light />
                </div>
                <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-1.5 text-sm">
                  <dt className="text-[#6B7266]">NISN</dt><dd>{detail.nisn ?? "-"}</dd>
                  <dt className="text-[#6B7266]">Jurusan</dt><dd>{detail.jurusan ?? "-"}</dd>
                  <dt className="text-[#6B7266]">Tanggal lahir</dt><dd>{tanggal(detail.tanggal_lahir)}</dd>
                  <dt className="text-[#6B7266]">No. HP</dt><dd>{detail.no_hp ?? "-"}</dd>
                  <dt className="text-[#6B7266]">Alamat</dt><dd>{detail.alamat ?? "-"}</dd>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    ["diterima", "Dinyatakan Lulus", btnGreen],
                    ["ditolak", "Tidak Lulus", btnRed],
                  ].map(([status, label, cls]) => (
                    <form key={status} action={ubahStatusPendaftar}>
                      <input type="hidden" name="userId" value={detail.id} />
                      <input type="hidden" name="status" value={status} />
                      <button className={cls} disabled={detail.status === status}>{label}</button>
                    </form>
                  ))}
                  {detail.status !== "menunggu" && (
                    <form action={ubahStatusPendaftar}>
                      <input type="hidden" name="userId" value={detail.id} />
                      <input type="hidden" name="status" value="menunggu" />
                      <button className="rounded-md border border-[#123223]/30 px-3 py-1.5 text-xs font-semibold hover:bg-[#EDEEE8]">
                        Kembalikan ke menunggu
                      </button>
                    </form>
                  )}
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="font-bold">Daftar Berkas</h2>
                <ul className="mt-3 divide-y divide-[#EDEEE8]">
                  {Object.entries(JENIS_BERKAS).map(([jenis, label]) => {
                    const b = berkas.find((x) => x.jenis === jenis);
                    return (
                      <li key={jenis} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="font-semibold">{label}</span>
                        {b ? (
                          <span className="flex items-center gap-3">
                            <Link
                              href={`?id=${detail.id}&berkas=${b.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                              className="font-semibold text-[#15803D] hover:underline"
                            >
                              Lihat
                            </Link>
                            <a href={`/api/berkas/${b.id}`} target="_blank" rel="noreferrer" className="text-xs text-[#6B7266] hover:underline">
                              Buka tab baru
                            </a>
                          </span>
                        ) : (
                          <span className="text-xs text-red-600">Belum diunggah</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-bold">
                {aktif ? JENIS_BERKAS[aktif.jenis] : "Pratinjau berkas"}
              </h2>
              {aktif ? (
                <div className="mt-3">
                  {aktif.mime.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/berkas/${aktif.id}`} alt={aktif.nama_asli} className="max-h-[32rem] w-full rounded-lg object-contain" />
                  ) : (
                    <iframe src={`/api/berkas/${aktif.id}`} title={aktif.nama_asli} className="h-[32rem] w-full rounded-lg border" />
                  )}
                  <p className="mt-2 text-xs text-[#6B7266]">{aktif.nama_asli}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#6B7266]">Pendaftar ini belum mengunggah berkas apa pun.</p>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
