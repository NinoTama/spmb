"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kirimJawaban } from "../../app/dashboard/calon-siswa/actions";

const fileInput =
  "block w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#E6ECE4] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#123223] hover:file:bg-[#DFE6D4]";
const submitBtn =
  "rounded-lg bg-[#15803D] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#123223] disabled:opacity-60";

function usePost(endpoint) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(endpoint, { method: "POST", body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok, text: data.message ?? (res.ok ? "Berhasil." : "Gagal.") });
      if (res.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: "Tidak bisa terhubung ke server." });
    } finally {
      setLoading(false);
    }
  }
  return { submit, loading, msg };
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <p
      role="alert"
      className={`rounded-lg border px-3 py-2 text-sm ${
        msg.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {msg.text}
    </p>
  );
}

export function UploadBerkasForm({ jenis, ada }) {
  const { submit, loading, msg } = usePost("/api/berkas");
  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="hidden" name="jenis" value={jenis} />
      <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className={fileInput} />
      <p className="text-xs text-[#6B7266]">PDF, JPG, atau PNG. Maksimal 5 MB.</p>
      <button disabled={loading} className={submitBtn}>
        {loading ? "Mengunggah..." : ada ? "Ganti berkas" : "Unggah"}
      </button>
      <Msg msg={msg} />
    </form>
  );
}

export function PembayaranForm() {
  const { submit, loading, msg } = usePost("/api/pembayaran");
  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-sm font-semibold text-white">
        Metode pembayaran
        <select
          name="metode"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#143629] px-3 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        >
          <option value="" disabled>Pilih metode pembayaran</option>
          <option value="VA BCA">VA BCA</option>
          <option value="QRIS">QRIS</option>
        </select>
      </label>
      <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white/65">
        Pastikan detail tujuan transfer sesuai informasi resmi dari pihak sekolah sebelum membayar.
      </p>
      <div className="rounded-xl border border-dashed border-white/25 p-4">
        <p className="mb-2 text-sm font-semibold text-white">Bukti pembayaran</p>
        <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className={fileInput} />
        <p className="mt-2 text-xs text-white/50">Pilih file JPG, PNG, atau PDF. Maksimal 5 MB.</p>
      </div>
      <button
        disabled={loading}
        className="w-full rounded-lg bg-[#10B981] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#059669] disabled:opacity-60"
      >
        {loading ? "Mengirim..." : "Konfirmasi Pembayaran"}
      </button>
      <Msg msg={msg} />
    </form>
  );
}

export function TesForm({ soal }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  async function onSubmit(event) {
    event.preventDefault();
    if (!confirm("Kirim jawaban sekarang? Jawaban tidak bisa diubah setelah dikirim.")) return;
    setPending(true);
    setError("");
    const formData = new FormData();
    for (const item of soal) {
      formData.set(`soal_${item.id}`, answers[item.id] ?? "");
    }
    try {
      const res = await kirimJawaban(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const question = soal[current];
  const terjawab = soal.filter((item) => String(answers[item.id] ?? "").trim()).length;

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(260px,0.8fr)]">
      <section className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">{question.mapel} · Soal {current + 1} dari {soal.length}</p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{terjawab} dijawab</span>
        </div>
        <p className="mt-5 text-lg font-bold leading-relaxed">{question.pertanyaan}</p>
        {question.tipe === "pilihan_ganda" ? (
          <div className="mt-5 space-y-2">
            {["A", "B", "C", "D"].map((key) => {
              const selected = answers[question.id] === key;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    selected ? "border-emerald-400 bg-emerald-500/15" : "border-white/10 hover:border-white/25 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name={`answer_${question.id}`}
                    value={key}
                    checked={selected}
                    onChange={() => setAnswers((old) => ({ ...old, [question.id]: key }))}
                    className="accent-emerald-400"
                  />
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs font-bold">{key}</span>
                  <span>{question[`opsi_${key.toLowerCase()}`]}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <textarea
            value={answers[question.id] ?? ""}
            onChange={(event) => setAnswers((old) => ({ ...old, [question.id]: event.target.value }))}
            rows={6}
            maxLength={5000}
            placeholder="Tulis jawabanmu di sini..."
            className="mt-5 w-full rounded-xl border border-white/10 bg-[#143629] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400"
          />
        )}
        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setCurrent((index) => index - 1)}
            className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          {current < soal.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrent((index) => index + 1)}
              className="rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-bold hover:bg-[#059669]"
            >
              Selanjutnya →
            </button>
          ) : (
            <button disabled={pending} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold hover:bg-red-600 disabled:opacity-60">
              {pending ? "Mengirim..." : "Selesai & Kumpulkan"}
            </button>
          )}
        </div>
      </section>

      <aside className="rounded-2xl bg-[#06291D] p-5 text-white shadow-lg">
        <h2 className="font-bold">Navigasi Soal</h2>
        <p className="mt-1 text-xs text-white/55">Pilih nomor untuk berpindah soal.</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {soal.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Buka soal ${index + 1}`}
              aria-current={current === index ? "step" : undefined}
              onClick={() => setCurrent(index)}
              className={`aspect-square rounded-lg text-xs font-bold transition ${
                current === index
                  ? "border border-amber-400 bg-amber-400/10 text-amber-200"
                  : String(answers[item.id] ?? "").trim()
                  ? "bg-[#10B981] text-white"
                  : "bg-white/10 text-white/65 hover:bg-white/20"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-white/60">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#10B981]" />Dijawab</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-white/20" />Belum</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-amber-300" />Sekarang</span>
        </div>
        {current < soal.length - 1 && (
          <button
            type="button"
            onClick={() => setCurrent(soal.length - 1)}
            className="mt-5 w-full rounded-lg bg-red-500 px-3 py-2.5 text-xs font-bold hover:bg-red-600"
          >
            Ke soal terakhir
          </button>
        )}
      </aside>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 xl:col-span-2">{error}</p>
      )}
    </form>
  );
}
