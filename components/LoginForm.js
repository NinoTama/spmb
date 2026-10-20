"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "./AuthShell";
import Field from "./Field";
import { LOGIN_ROLE, ROLE_HOME } from "../lib/roles";

export default function LoginForm({
  role,
  title,
  subtitle,
  notice,
  emailLabel = "Email",
  emailPlaceholder = "nama@domain.com",
  footer,
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          expectedRole: LOGIN_ROLE[role],
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "Login gagal. Periksa email dan password.");
        return;
      }

      // Tujuan ditentukan dari role yang dibaca server dari database
      const target = ROLE_HOME[data.user?.role];
      if (!target) {
        setError("Role akun tidak dikenali.");
        return;
      }

      router.push(target);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
        {notice && (
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          >
            {notice}
          </p>
        )}
        <Field
          label={emailLabel}
          icon="mail"
          name="email"
          type="email"
          placeholder={emailPlaceholder}
          autoComplete="username"
        />
        <Field
          label="Password"
          icon="lock"
          name="password"
          type="password"
          placeholder="Masukkan password"
          autoComplete="current-password"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-xl bg-[#15803D] py-3 text-base font-bold text-white shadow-lg shadow-[#15803D]/30 transition hover:bg-[#126a33] focus:outline-none focus:ring-2 focus:ring-[#15803D]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:text-lg"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        <div className="text-center text-xs font-semibold text-[#526E5D]">
          {footer}
        </div>
      </form>
    </AuthShell>
  );
}
