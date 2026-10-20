"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "../../components/AuthShell";
import Field from "../../components/Field";
import { JURUSAN } from "../../lib/school";

// Daftar jurusan diatur di lib/school.js
const JURUSAN_OPTIONS = JURUSAN.map((j) => j.name);

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const form = Object.fromEntries(new FormData(e.currentTarget));

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Role tidak dikirim: ditentukan server (calon_siswa).
        body: JSON.stringify({
          nama: form.fullName,
          email: form.email,
          password: form.password,
          alamat: form.address,
          tanggal_lahir: form.birthDate,
          nisn: form.nisn,
          jurusan: form.major,
          no_hp: form.phone,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "Pendaftaran gagal. Coba lagi.");
        return;
      }
      router.push("/login/student?created=1");
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Pendaftaran Siswa Baru" wide>
      <form
        onSubmit={handleSubmit}
        className="grid gap-x-4 gap-y-3 sm:grid-cols-2"
      >
        <Field
          className="sm:col-span-2"
          label="Nama Lengkap"
          icon="user"
          name="fullName"
          placeholder="Nama lengkap sesuai ijazah"
          autoComplete="name"
        />
        <Field
          className="sm:col-span-2"
          label="Alamat"
          icon="pin"
          name="address"
          placeholder="Alamat tinggal saat ini"
          autoComplete="street-address"
        />
        <Field
          label="Tanggal Lahir"
          icon="calendar"
          name="birthDate"
          type="date"
        />
        <Field
          label="Email"
          icon="mail"
          name="email"
          type="email"
          placeholder="nama@domain.com"
          autoComplete="email"
        />
        <Field
          label="NISN"
          icon="card"
          name="nisn"
          placeholder="10 digit nomor induk"
          inputMode="numeric"
          pattern="\d{10}"
          title="NISN terdiri dari 10 digit angka"
        />
        <Field
          label="Jurusan Tujuan"
          icon="cap"
          name="major"
          placeholder="Pilih Jurusan"
          options={JURUSAN_OPTIONS}
        />
        <Field
          className="sm:col-span-2"
          label="No. HP"
          icon="phone"
          name="phone"
          type="tel"
          placeholder="081234567xxx"
          autoComplete="tel"
        />
        <Field
          label="Password"
          icon="lock"
          name="password"
          type="password"
          placeholder="Buat password"
          minLength={8}
          autoComplete="new-password"
        />
        <Field
          label="Konfirmasi Password"
          icon="lock"
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password"
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-[#15803D] py-3 text-lg font-bold text-white shadow-lg shadow-[#15803D]/30 transition hover:bg-[#126a33] focus:outline-none focus:ring-2 focus:ring-[#15803D]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>

        <p className="text-center text-xs font-semibold text-[#526E5D] sm:col-span-2">
          Sudah punya akun{" "}
          <Link
            href="/login/student"
            className="rounded bg-[#123223] px-2 py-0.5 text-white"
          >
            Masuk
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
