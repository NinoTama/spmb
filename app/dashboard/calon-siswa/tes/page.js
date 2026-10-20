import Link from "next/link";
import pool from "../../../../lib/db";
import { getStudentContext } from "../../../../lib/student";
import StudentTopbar from "../../../../components/student/StudentTopbar";
import { TesForm } from "../../../../components/student/Forms";

export default async function TesSiswa() {
  const { userId, me } = await getStudentContext();

  let isi;

  if (me.bayar !== "lunas") {
    // Terkunci: soal tidak diambil dari database sama sekali
    isi = (
      <section className="max-w-xl rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-extrabold">Tes belum bisa dikerjakan</h2>
        <p className="mt-2 text-sm">
          Pembayaranmu harus dikonfirmasi admin dulu (status Lunas) sebelum kamu bisa mengerjakan soal.
        </p>
        <Link
          href="/dashboard/calon-siswa/pembayaran"
          className="mt-4 inline-block rounded-lg bg-[#15803D] px-5 py-2 text-sm font-bold text-white hover:bg-[#123223]"
        >
          Ke halaman pembayaran
        </Link>
      </section>
    );
  } else {
    const [hasilRows] = await pool.query(
      "SELECT skor_pg, total_pg FROM hasil_tes WHERE user_id = ?",
      [userId]
    );

    if (hasilRows[0]) {
      const h = hasilRows[0];
      isi = (
        <section className="max-w-xl rounded-2xl bg-[#06291D] p-6 text-white shadow-lg">
          <h2 className="text-lg font-extrabold">Jawabanmu sudah terkirim</h2>
          <p className="mt-3 text-sm text-white/55">Skor pilihan ganda</p>
          <p className="text-4xl font-extrabold text-emerald-300">{h.skor_pg}/{h.total_pg}</p>
          <p className="mt-3 text-xs text-white/55">Soal esai dinilai oleh pihak sekolah.</p>
        </section>
      );
    } else {
      // kunci jawaban sengaja tidak ikut diambil
      const [rows] = await pool.query(
        "SELECT id, pertanyaan, mapel, tipe, opsi_a, opsi_b, opsi_c, opsi_d FROM soal ORDER BY id"
      );
      const soal = rows.map((r) => ({ ...r }));

      isi =
        soal.length === 0 ? (
            <p className="rounded-xl bg-[#06291D] p-5 text-sm text-white/65">Belum ada soal dari admin. Cek lagi nanti.</p>
        ) : (
          <TesForm soal={soal} />
        );
    }
  }

  return (
    <>
      <StudentTopbar title="Kerjakan Tes" nama={me.nama} />
      <main className="flex-1 space-y-6 p-5 sm:p-8">{isi}</main>
    </>
  );
}
