"use client";

import { useEffect, useState } from "react";

export default function BuktiPembayaranModal({ userId, nama, mime }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const url = `/api/bukti/${userId}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block rounded-md border border-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
      >
        Lihat Bukti
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`bukti-${userId}`}
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#EDEEE8] px-5 py-4">
              <h2 id={`bukti-${userId}`} className="font-bold text-[#123223]">
                Bukti Pembayaran — {nama}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup bukti pembayaran"
                className="rounded-lg px-3 py-1 text-xl text-[#526E5D] hover:bg-[#EDEEE8]"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-[#EDEEE8] p-4">
              {mime?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`Bukti pembayaran ${nama}`} className="mx-auto max-h-[75vh] max-w-full rounded-lg object-contain" />
              ) : (
                <iframe src={url} title={`Bukti pembayaran ${nama}`} className="h-[75vh] w-full rounded-lg border-0 bg-white" />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
