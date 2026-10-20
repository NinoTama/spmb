"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { imporSoalCsv } from "../../app/dashboard/admin/actions";

const TEMPLATE = [
  "mapel,tipe,pertanyaan,opsi_a,opsi_b,opsi_c,opsi_d,kunci",
  'Matematika,pilihan_ganda,"Berapakah hasil 2 + 2?",3,4,5,6,B',
  'Bahasa Indonesia,esai,"Jelaskan pengertian ide pokok.",,,,,',
].join("\n");

export default function BulkSoalImport({ onClose }) {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  function downloadTemplate() {
    const file = new Blob([TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-soal.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const result = await imporSoalCsv(csv);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setCsv("");
      setSuccess(`${result.count} soal berhasil ditambahkan.`);
      router.refresh();
    } catch {
      setError("Impor soal gagal karena terjadi kesalahan server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-5 text-[#123223] shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Impor Banyak Soal</h2>
          <p className="mt-1 text-sm text-slate-600">
            Unggah soal dengan menempelkan isi CSV. Maksimal 200 soal sekali impor.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Tutup
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-950">
        <p className="font-bold">Format CSV</p>
        <p className="mt-1">
          Kolom wajib: mapel, tipe, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci.
          Untuk pilihan ganda, isi semua opsi dan kunci A-D. Untuk esai, tipe isi
          <code className="mx-1 rounded bg-white px-1">esai</code> dan kosongkan kolom opsi serta kunci.
          Jika teks berisi koma, apit dengan tanda kutip ganda.
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="mt-3 font-bold text-emerald-800 underline underline-offset-2"
        >
          Unduh template CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold">
          Isi CSV
          <textarea
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            required
            rows={10}
            placeholder={TEMPLATE}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#126a33] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Mengimpor..." : "Impor Soal"}
        </button>
      </form>
    </section>
  );
}
