"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffAccountManager() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (values.password !== values.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/akun-pengelola", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: values.nama,
          email: values.email,
          password: values.password,
          role: values.role,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message ?? "Akun gagal dibuat. Coba lagi.");
        return;
      }

      const loginPath = values.role === "admin" ? "/login/admin" : "/login/principal";
      router.push(`${loginPath}?created=1`);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Nama lengkap
        <input
          className={inputClass}
          name="nama"
          type="text"
          placeholder="Nama lengkap"
          autoComplete="name"
          maxLength={100}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Email
        <input
          className={inputClass}
          name="email"
          type="email"
          placeholder="nama@domain.com"
          autoComplete="email"
          maxLength={150}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Role akun
        <select className={inputClass} name="role" defaultValue="kepsek" required>
          <option value="kepsek">Kepala Sekolah</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <span aria-hidden="true" className="hidden sm:block" />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Password
        <input
          className={inputClass}
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
        Konfirmasi password
        <input
          className={inputClass}
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#15803D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#126a33] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
      >
        {loading ? "Menyimpan..." : "Buat Akun"}
      </button>
    </form>
  );
}
