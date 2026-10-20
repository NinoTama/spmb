import Link from "next/link";
import { getStudentContext } from "../../../../lib/student";
import pool from "../../../../lib/db";
import { StatusPendaftar } from "../../../../components/ui";
import StudentTopbar from "../../../../components/student/StudentTopbar";

export default async function HasilSiswa() {
  const { me, userId } = await getStudentContext();
  const [hasilRows] = await pool.query(
    "SELECT skor_pg, total_pg, dikirim_at FROM hasil_tes WHERE user_id = ?",
    [userId]
  );
  const hasil = hasilRows[0];
  const diterima = me.status === "diterima";
  const ditolak = me.status === "ditolak";

  return (
    <>
      <StudentTopbar title="Hasil / Pengumuman" nama={me.nama} />
      <main className="flex-1 space-y-5 p-5 sm:p-8">
        <section className={`rounded-2xl p-6 text-center text-white shadow-lg sm:p-9 ${
          diterima ? "bg-gradient-to-br from-[#064E3B] to-[#047857]" : "bg-[#06291D]"
        }`}>
          <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide ${
            diterima ? "bg-emerald-300/20 text-emerald-200" : ditolak ? "bg-red-400/15 text-red-200" : "bg-amber-300/15 text-amber-200"
          }`}>
            {diterima ? "Dinyatakan Lulus" : ditolak ? "Pendaftaran Ditolak" : "Menunggu Pengumuman"}
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">
            {diterima ? `Selamat, ${me.nama}!` : ditolak ? "Status Pendaftaran" : "Hasil belum tersedia"}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/70">
            {diterima
              ? `Pendaftaranmu diterima${me.jurusan ? ` pada jurusan ${me.jurusan}` : ""}.`
              : ditolak
              ? "Pendaftaranmu belum dapat diterima. Silakan hubungi pihak sekolah untuk informasi lebih lanjut."
              : "Admin masih memeriksa pendaftaranmu. Pengumuman akan tampil di halaman ini setelah status diperbarui."}
          </p>
          <div className="mt-5"><StatusPendaftar value={me.status} /></div>
        </section>

        <div className="grid gap-5 sm:grid-cols-3">
          <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg">
            <p className="text-xs font-semibold text-white/55">TES MASUK</p>
            <p className="mt-3 text-3xl font-extrabold text-emerald-300">
              {hasil ? `${hasil.skor_pg}/${hasil.total_pg}` : "—"}
            </p>
            <p className="mt-1 text-xs text-white/55">Skor pilihan ganda</p>
          </section>
          <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg">
            <p className="text-xs font-semibold text-white/55">JURUSAN</p>
            <p className="mt-3 text-lg font-bold">{me.jurusan || "Belum dipilih"}</p>
            <p className="mt-1 text-xs text-white/55">Pilihan pendaftaran</p>
          </section>
          <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg">
            <p className="text-xs font-semibold text-white/55">STATUS PEMERIKSAAN</p>
            <div className="mt-3"><StatusPendaftar value={me.status} /></div>
            <p className="mt-2 text-xs text-white/55">{hasil ? "Jawaban tes sudah dikirim." : "Status mengikuti verifikasi admin."}</p>
          </section>
        </div>

        {hasil && (
          <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg">
            <h2 className="font-bold">Rincian Tes</h2>
            <p className="mt-2 text-sm text-white/60">
              Skor pilihan ganda: {hasil.skor_pg} dari {hasil.total_pg}. Jawaban esai dinilai oleh pihak sekolah.
            </p>
          </section>
        )}

        {diterima && (
          <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg">
            <h2 className="font-bold">Langkah Selanjutnya: Daftar Ulang</h2>
            <ol className="mt-4 space-y-3 text-sm text-white/70">
              <li><span className="mr-2 font-bold text-emerald-300">1.</span>Hubungi sekolah untuk jadwal dan persyaratan daftar ulang.</li>
              <li><span className="mr-2 font-bold text-emerald-300">2.</span>Siapkan dokumen asli untuk proses pencocokan.</li>
              <li><span className="mr-2 font-bold text-emerald-300">3.</span>Ikuti arahan panitia penerimaan siswa baru.</li>
            </ol>
          </section>
        )}

        {!hasil && !diterima && !ditolak && (
          <Link
            href="/dashboard/calon-siswa/tes"
            className="inline-flex rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#059669]"
          >
            Lihat status tes
          </Link>
        )}
      </main>
    </>
  );
}
