"use client";

import { useState } from "react";
import { Icon } from "../Icons";
import { Badge, StatCard, tableWrap, th, td } from "../ui";
import { simpanSoal, hapusSoal } from "../../app/dashboard/admin/actions";
import BulkSoalImport from "./BulkSoalImport";

const MAPEL_UMUM = ["Matematika", "IPA", "Bahasa Indonesia", "Bahasa Inggris", "PPKn"];
const input =
  "mt-1 w-full rounded-lg border border-[#123223]/25 bg-white px-3 py-2 text-sm outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/30";

function SoalForm({ soal, mapelList, onClose }) {
  const [tipe, setTipe] = useState(soal?.tipe ?? "pilihan_ganda");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData) {
    setPending(true);
    setError("");
    const res = await simpanSoal(formData);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    onClose();
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {soal && <input type="hidden" name="id" value={soal.id} />}
      <h2 className="text-lg font-extrabold">{soal ? "Ubah Soal" : "Tambah Soal"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Mapel
          <input name="mapel" list="daftar-mapel" required maxLength={50} defaultValue={soal?.mapel ?? ""} className={input} />
          <datalist id="daftar-mapel">
            {mapelList.map((m) => <option key={m} value={m} />)}
          </datalist>
        </label>
        <label className="block text-sm font-semibold">
          Tipe
          <select name="tipe" value={tipe} onChange={(e) => setTipe(e.target.value)} className={input}>
            <option value="pilihan_ganda">Pilihan Ganda</option>
            <option value="esai">Esai</option>
          </select>
        </label>
      </div>

      <label className="block text-sm font-semibold">
        Pertanyaan
        <textarea name="pertanyaan" required rows={3} defaultValue={soal?.pertanyaan ?? ""} className={input} />
      </label>

      {tipe === "pilihan_ganda" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {["a", "b", "c", "d"].map((k) => (
              <label key={k} className="block text-sm font-semibold">
                Opsi {k.toUpperCase()}
                <input name={`opsi_${k}`} required maxLength={255} defaultValue={soal?.[`opsi_${k}`] ?? ""} className={input} />
              </label>
            ))}
          </div>
          <label className="block text-sm font-semibold sm:w-1/2">
            Kunci jawaban
            <select name="kunci" required defaultValue={soal?.kunci ?? "A"} className={input}>
              {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-[#123223]/25 px-4 py-2 text-sm font-semibold hover:bg-[#EDEEE8]">
          Batal
        </button>
        <button disabled={pending} className="rounded-lg bg-[#15803D] px-5 py-2 text-sm font-bold text-white hover:bg-[#123223] disabled:opacity-60">
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}

export default function SoalManager({ soal }) {
  const [q, setQ] = useState("");
  const [mapel, setMapel] = useState("");
  const [modal, setModal] = useState(null); // null | { soal: objek | null }
  const [showBulkImport, setShowBulkImport] = useState(false);

  const mapelList = [...new Set([...MAPEL_UMUM, ...soal.map((s) => s.mapel)])];
  const pg = soal.filter((s) => s.tipe === "pilihan_ganda").length;

  const tampil = soal.filter(
    (s) =>
      (!mapel || s.mapel === mapel) &&
      s.pertanyaan.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total soal" value={soal.length} />
        <StatCard label="Pilihan ganda" value={pg} />
        <StatCard label="Esai" value={soal.length - pg} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari soal..."
            className="w-full rounded-lg bg-[#123223] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400/60"
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <select
            value={mapel}
            onChange={(e) => setMapel(e.target.value)}
            className="rounded-lg bg-[#123223] px-3 py-2 text-sm text-white outline-none"
          >
            <option value="">Semua Mapel</option>
            {mapelList.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setShowBulkImport((shown) => !shown)}
            className="flex items-center gap-1.5 rounded-lg bg-[#123223] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#1E4A34] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Icon name="upload" className="h-4 w-4" />
            Impor Banyak Soal
          </button>
          <button
            onClick={() => setModal({ soal: null })}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-400"
          >
            <Icon name="plus" className="h-4 w-4" /> Tambah Soal
          </button>
        </div>
      </div>

      {showBulkImport && (
        <BulkSoalImport onClose={() => setShowBulkImport(false)} />
      )}

      <section className={tableWrap}>
        <table className="w-full">
          <thead>
            <tr>
              <th className={th}>No</th>
              <th className={th}>Pertanyaan</th>
              <th className={th}>Mapel</th>
              <th className={th}>Tipe</th>
              <th className={th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tampil.length === 0 && (
              <tr>
                <td colSpan={5} className={`${td} text-center text-white/60`}>
                  {soal.length === 0 ? "Belum ada soal. Klik Tambah Soal." : "Tidak ada soal yang cocok."}
                </td>
              </tr>
            )}
            {tampil.map((s, i) => (
              <tr key={s.id} className="border-t border-white/10 hover:bg-white/5">
                <td className={td}>{i + 1}</td>
                <td className={`${td} max-w-md`}><p className="line-clamp-2">{s.pertanyaan}</p></td>
                <td className={td}>{s.mapel}</td>
                <td className={td}>
                  <Badge tone={s.tipe === "esai" ? "amber" : "blue"}>
                    {s.tipe === "esai" ? "Esai" : "Pilihan Ganda"}
                  </Badge>
                </td>
                <td className={td}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModal({ soal: s })}
                      title="Ubah"
                      className="rounded-md bg-white/10 p-2 transition hover:bg-white/20"
                    >
                      <Icon name="edit" className="h-3.5 w-3.5" />
                    </button>
                    <form
                      action={hapusSoal}
                      onSubmit={(e) => {
                        if (!confirm("Hapus soal ini? Jawaban siswa untuk soal ini ikut terhapus.")) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <button title="Hapus" className="rounded-md bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500/40">
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-[#123223] shadow-2xl">
            <SoalForm
              key={modal.soal?.id ?? "baru"}
              soal={modal.soal}
              mapelList={mapelList}
              onClose={() => setModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
