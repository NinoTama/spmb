import Link from "next/link";
import pool from "../../../lib/db";
import { getStudentContext } from "../../../lib/student";
import Topbar from "../../../components/admin/Topbar";
import { StatusPendaftar, StatusBayar } from "../../../components/ui";
import { JENIS_BERKAS } from "../../../lib/format";
import StudentTopbar from "../../../components/student/StudentTopbar";

const card = "rounded-2xl bg-[#06291D] p-5 text-white shadow-lg transition hover:bg-[#0A3526] sm:p-6";

export default async function BerandaSiswa() {
  const { session, userId, me } = await getStudentContext();

  const [berkas] = await pool.query(
    "SELECT jenis, nama_asli FROM berkas WHERE user_id = ?",
    [userId]
  );
  const [hasilRows] = await pool.query(
    "SELECT skor_pg, total_pg FROM hasil_tes WHERE user_id = ?",
    [userId]
  );
  const hasil = hasilRows[0];
  const jumlahBerkas = Number(berkas.length);
  const totalJenis = Object.keys(JENIS_BERKAS).length;
  const lunas = me.bayar === "lunas";
  const berkasLengkap = jumlahBerkas === totalJenis;
  const langkahAktif = !berkasLengkap ? 1 : !lunas ? 2 : !hasil ? 2 : 3;

  const steps = [
    { title: "Daftar", description: "Selesai" },
    { title: "Verifikasi Berkas", description: berkasLengkap ? "Berkas lengkap" : "Lengkapi berkas" },
    { title: "Tes Masuk", description: hasil ? "Selesai dikerjakan" : lunas ? "Siap dikerjakan" : "Menunggu pembayaran" },
    { title: "Pengumuman", description: me.status === "menunggu" ? "Belum tersedia" : me.status === "diterima" ? "Dinyatakan lulus" : "Hasil tersedia" },
  ];

  return (
    <>
      <StudentTopbar title="Dashboard" nama={me.nama ?? session.nama} />
      <main className="flex-1 space-y-5 p-5 sm:p-8">
        <section className={`${card} flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <h2 className="text-xl font-extrabold">Halo, {me.nama}</h2>
            <p className="mt-1 text-sm text-white/60">Pantau terus status pendaftaranmu di sini.</p>
          </div>
          <p className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">
            No. Pendaftaran: {String(me.id).padStart(8, "0")}
          </p>
        </section>

        {me.bayar === "belum_bayar" && me.diingatkan_at && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Admin mengingatkan kamu untuk segera melakukan pembayaran.{" "}
            <Link href="/dashboard/calon-siswa/pembayaran" className="font-bold underline">
              Bayar sekarang
            </Link>
          </div>
        )}

        {me.pembayaran_terlambat && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            Batas pembayaran {me.batas_pembayaran_label} sudah lewat. Pembayaran tetap bisa dilakukan.{" "}
            <Link href="/dashboard/calon-siswa/pembayaran" className="font-bold underline">
              Bayar sekarang
            </Link>
          </div>
        )}

        <section className={card}>
          <h2 className="font-bold">Status Pendaftaran</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {steps.map((step, index) => {
              const complete = index === 0 || (index === 1 && berkasLengkap) || (index === 2 && Boolean(hasil)) || (index === 3 && me.status !== "menunggu");
              const active = index === langkahAktif && !complete;
              return (
                <div key={step.title} className="flex items-start gap-3 sm:flex-col">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    complete ? "bg-emerald-500 text-white" : active ? "border border-amber-400 text-amber-300" : "bg-black/25 text-white/50"
                  }`}>
                    {complete ? "✓" : index + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${active ? "text-amber-200" : ""}`}>{step.title}</p>
                    <p className="text-xs text-white/50">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className={card}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">Status Berkas</h2>
              <Link href="/dashboard/calon-siswa/berkas" className="text-xs font-semibold text-emerald-300 hover:underline">Lihat</Link>
            </div>
            <ul className="mt-4 space-y-3">
              {Object.entries(JENIS_BERKAS).map(([jenis, label]) => {
                const file = berkas.find((item) => item.jenis === jenis);
                return (
                  <li key={jenis} className="flex items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
                    <span>{label}</span>
                    <span className={file ? "text-emerald-300" : "text-amber-300"}>{file ? "Terunggah" : "Belum lengkap"}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <Link href="/dashboard/calon-siswa/tes" className={card}>
            <p className="text-xs font-semibold text-white/55">TES MASUK</p>
            <p className="mt-3 font-bold">{!lunas ? "Belum dijadwalkan" : hasil ? "Selesai dikerjakan" : "Siap dikerjakan"}</p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              {!lunas ? "Tes tersedia setelah pembayaran dikonfirmasi." : hasil ? `Skor pilihan ganda: ${hasil.skor_pg}/${hasil.total_pg}` : "Pembayaran telah dikonfirmasi. Kamu bisa mulai tes."}
            </p>
            <span className="mt-4 inline-block rounded-lg bg-[#10B981] px-3 py-2 text-xs font-bold text-white">
              {lunas && !hasil ? "Kerjakan Tes" : "Lihat Tes"}
            </span>
          </Link>

          <Link href="/dashboard/calon-siswa/hasil" className={card}>
            <p className="text-xs font-semibold text-white/55">HASIL / PENGUMUMAN</p>
            <div className="mt-3"><StatusPendaftar value={me.status} /></div>
            <p className="mt-3 text-xs leading-5 text-white/55">
              {me.status === "menunggu" ? "Hasil akan tersedia setelah proses verifikasi selesai." : "Buka halaman hasil untuk melihat status pendaftaranmu."}
            </p>
          </Link>

          <Link href="/dashboard/calon-siswa/pembayaran" className={`${card} lg:col-span-3`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white/55">PEMBAYARAN</p>
                <p className="mt-2 font-bold">{me.bayar === "lunas" ? "Pembayaran terkonfirmasi" : me.bayar === "menunggu_konfirmasi" ? "Menunggu konfirmasi" : "Selesaikan pembayaran"}</p>
              </div>
              <StatusBayar value={me.bayar} />
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
