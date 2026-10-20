import pool from "../../../../lib/db";
import { getStudentContext } from "../../../../lib/student";
import StudentTopbar from "../../../../components/student/StudentTopbar";
import { UploadBerkasForm } from "../../../../components/student/Forms";
import { JENIS_BERKAS, tanggal } from "../../../../lib/format";

export default async function BerkasSiswa() {
  const { me, userId } = await getStudentContext();

  const [rows] = await pool.query(
    "SELECT id, jenis, nama_asli, mime, uploaded_at FROM berkas WHERE user_id = ?",
    [userId]
  );
  const lengkap = rows.length === Object.keys(JENIS_BERKAS).length;

  return (
    <>
      <StudentTopbar title="Berkas" nama={me.nama} />
      <main className="flex-1 space-y-5 p-5 sm:p-8">
        {!lengkap && (
          <p className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-900">
            Ada {Object.keys(JENIS_BERKAS).length - rows.length} dokumen yang belum kamu unggah agar proses verifikasi bisa dilanjutkan.
          </p>
        )}
        <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Dokumen Pendaftaran</h2>
              <p className="mt-1 text-xs text-white/55">PDF, JPG, atau PNG. Maksimal 5 MB per berkas.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${lengkap ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>
              {rows.length}/{Object.keys(JENIS_BERKAS).length} diunggah
            </span>
          </div>
          <ul className="divide-y divide-white/10">
            {Object.entries(JENIS_BERKAS).map(([jenis, label]) => {
              const b = rows.find((r) => r.jenis === jenis);
              return (
                <li key={jenis} className="grid gap-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-500 text-[10px] font-extrabold text-white">
                      {b?.mime?.includes("pdf") ? "PDF" : b ? "IMG" : "UP"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{label}</p>
                      <p className="truncate text-xs text-white/50">
                        {b ? `${b.nama_asli} · Diunggah ${tanggal(b.uploaded_at)}` : "Belum diunggah"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs font-semibold ${b ? "text-emerald-300" : "text-amber-200"}`}>
                      {b ? "Terunggah" : "Belum lengkap"}
                    </span>
                    {b && (
                      <a href={`/api/berkas/${b.id}`} target="_blank" rel="noreferrer" className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/10">
                        Lihat
                      </a>
                    )}
                    <UploadBerkasForm jenis={jenis} ada={Boolean(b)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
