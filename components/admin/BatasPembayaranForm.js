"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { simpanBatasPembayaran } from "../../app/dashboard/admin/actions";

export default function BatasPembayaranForm({ initialValue }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);
  const router = useRouter();

  function submit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await simpanBatasPembayaran(formData);
        if (result?.error) {
          setMessage({ error: true, text: result.error });
          return;
        }
        setMessage({
          error: false,
          text: formData.get("batasPembayaran")
            ? "Batas pembayaran berhasil disimpan."
            : "Batas pembayaran berhasil dihapus.",
        });
        router.refresh();
      } catch {
        setMessage({ error: true, text: "Batas pembayaran gagal disimpan. Silakan coba lagi." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#DFE6D4] bg-white p-5 shadow-sm">
      <h2 className="font-bold">Batas Pembayaran Siswa</h2>
      <p className="mt-1 text-sm text-[#6B7266]">
        Atur tanggal dan jam tenggat untuk semua siswa. Siswa yang belum membayar setelah tenggat akan mendapat peringatan, tetapi tetap bisa mengirim pembayaran.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm font-semibold">
          Tanggal dan jam tenggat
          <input
            type="datetime-local"
            name="batasPembayaran"
            defaultValue={initialValue ?? ""}
            className="mt-1 block rounded-lg border border-[#123223]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#15803D] px-4 py-2 text-sm font-bold text-white hover:bg-[#123223] disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan Tenggat"}
        </button>
        {initialValue && (
          <button
            type="button"
            disabled={pending}
            onClick={(event) => {
              const form = event.currentTarget.form;
              const input = form?.elements.namedItem("batasPembayaran");
              if (input) input.value = "";
              form?.requestSubmit();
            }}
            className="rounded-lg border border-[#123223]/20 px-4 py-2 text-sm font-semibold text-[#123223] hover:bg-[#EDEEE8] disabled:opacity-60"
          >
            Hapus Tenggat
          </button>
        )}
      </div>
      {message && (
        <p
          role={message.error ? "alert" : "status"}
          className={`mt-3 text-sm ${message.error ? "text-red-700" : "text-emerald-800"}`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
