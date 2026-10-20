"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editProfilSiswa } from "../../app/dashboard/admin/actions";

const field =
  "mt-1 w-full rounded-lg border border-[#123223]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20";
const label = "block text-sm font-semibold text-[#123223]";

export default function EditSiswaModal({ siswa, jurusanOptions }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      try {
        const result = await editProfilSiswa(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setOpen(false);
        router.refresh();
      } catch {
        setError("Profil siswa gagal disimpan. Silakan coba lagi.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-emerald-300 hover:underline"
      >
        Edit Profil
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !pending) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-siswa-${siswa.id}`}
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`edit-siswa-${siswa.id}`} className="text-xl font-extrabold text-[#123223]">
                  Edit Profil Siswa
                </h2>
                <p className="mt-1 text-sm text-[#6B7266]">{siswa.nama}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                aria-label="Tutup"
                className="rounded-lg px-3 py-1 text-xl text-[#526E5D] hover:bg-[#EDEEE8] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <input type="hidden" name="userId" value={siswa.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={label}>
                  Nama lengkap
                  <input name="nama" required maxLength={100} defaultValue={siswa.nama} className={field} />
                </label>
                <label className={label}>
                  Email
                  <input name="email" type="email" required maxLength={150} defaultValue={siswa.email ?? ""} className={field} />
                </label>
                <label className={label}>
                  NISN
                  <input name="nisn" inputMode="numeric" maxLength={10} defaultValue={siswa.nisn ?? ""} className={field} />
                </label>
                <label className={label}>
                  Nomor HP
                  <input name="no_hp" maxLength={20} defaultValue={siswa.no_hp ?? ""} className={field} />
                </label>
                <label className={label}>
                  Tanggal lahir
                  <input name="tanggal_lahir" type="date" defaultValue={siswa.tanggal_lahir ?? ""} className={field} />
                </label>
                <label className={label}>
                  Jurusan
                  <select name="jurusan" defaultValue={siswa.jurusan ?? ""} className={field}>
                    <option value="">Pilih jurusan</option>
                    {jurusanOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </label>
              </div>
              <label className={label}>
                Alamat
                <textarea name="alamat" maxLength={255} rows={3} defaultValue={siswa.alamat ?? ""} className={field} />
              </label>
              <label className={label}>
                Password baru
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  className={field}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
                <span className="mt-1 block text-xs font-normal text-[#6B7266]">
                  Minimal 8 karakter. Password lama tidak ditampilkan.
                </span>
              </label>
              {error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2 border-t border-[#EDEEE8] pt-4">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-[#123223]/20 px-4 py-2 text-sm font-semibold text-[#123223] hover:bg-[#EDEEE8] disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-[#15803D] px-4 py-2 text-sm font-bold text-white hover:bg-[#123223] disabled:opacity-60"
                >
                  {pending ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
