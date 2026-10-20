import { getStudentContext } from "../../../../lib/student";
import StudentTopbar from "../../../../components/student/StudentTopbar";
import { PembayaranForm } from "../../../../components/student/Forms";
import { StatusBayar } from "../../../../components/ui";
import { rupiah } from "../../../../lib/format";

export default async function PembayaranSiswa() {
  const { me, userId } = await getStudentContext();

  return (
    <>
      <StudentTopbar title="Pembayaran" nama={me.nama} />
      <main className="flex-1 space-y-5 p-5 sm:p-8">
        <section className="mx-auto w-full max-w-3xl rounded-2xl bg-[#06291D] p-5 text-white shadow-lg sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-white/55">TOTAL BIAYA PENDAFTARAN</p>
              <p className="mt-1 text-3xl font-extrabold">{rupiah(me.nominal)}</p>
            </div>
            <StatusBayar value={me.bayar} />
          </div>

          {me.bayar === "lunas" && (
            <p className="mt-5 rounded-lg bg-emerald-400/15 px-3 py-3 text-sm text-emerald-200">
              Pembayaranmu sudah dikonfirmasi admin. Kamu bisa mengerjakan tes.
            </p>
          )}

          {me.bayar !== "lunas" && me.batas_pembayaran_label && (
            <p className={`mt-5 rounded-lg px-3 py-3 text-sm ${
              me.pembayaran_terlambat
                ? "border border-red-300/30 bg-red-400/10 text-red-200"
                : "border border-amber-300/30 bg-amber-400/10 text-amber-100"
            }`}>
              {me.pembayaran_terlambat
                ? `Batas pembayaran ${me.batas_pembayaran_label} sudah lewat. Silakan segera membayar dan mengirim bukti pembayaran.`
                : `Batas pembayaran: ${me.batas_pembayaran_label}. Pastikan pembayaran dilakukan sebelum tenggat.`}
            </p>
          )}

          {me.bayar !== "lunas" && !me.batas_pembayaran_label && (
            <p className="mt-5 rounded-lg bg-white/5 px-3 py-3 text-sm text-white/65">
              Admin belum menetapkan batas pembayaran.
            </p>
          )}

          {me.bayar === "menunggu_konfirmasi" && (
            <p className="mt-4 rounded-lg bg-amber-400/10 px-3 py-3 text-sm text-amber-100">
              Bukti pembayaran ({me.metode}) sudah dikirim dan menunggu konfirmasi admin.{" "}
              <a href={`/api/bukti/${userId}`} target="_blank" rel="noreferrer" className="font-semibold underline">
                Lihat bukti
              </a>
              . Kamu bisa mengirim ulang kalau ada kesalahan.
            </p>
          )}

          {me.bayar === "belum_bayar" && me.diingatkan_at && (
            <p className="mt-4 rounded-lg bg-amber-400/10 px-3 py-3 text-sm text-amber-100">
              Admin mengingatkan kamu untuk segera membayar. Jika bukti sebelumnya ditolak, kirim bukti yang baru.
            </p>
          )}

          {me.bayar !== "lunas" && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-4 text-sm text-white/60">
                Pilih metode pembayaran, lalu unggah bukti transfer untuk dikonfirmasi admin.
              </p>
              <PembayaranForm />
            </div>
          )}
        </section>
      </main>
    </>
  );
}
