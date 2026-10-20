"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gantiPasswordSiswa, simpanProfilSiswa } from "../../app/dashboard/calon-siswa/actions";

const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-[#143629] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";
const label = "block text-xs font-semibold text-white/65";

function ProfileForm({ action, children }) {
  const [message, setMessage] = useState(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result?.error) {
          setMessage({ error: true, text: result.error });
          return;
        }
        setMessage({ error: false, text: "Perubahan berhasil disimpan." });
        form.reset();
        router.refresh();
      } catch {
        setMessage({ error: true, text: "Perubahan gagal disimpan. Silakan coba lagi." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {children}
      {message && (
        <p
          role={message.error ? "alert" : "status"}
          className={`rounded-lg px-3 py-2 text-sm ${message.error ? "bg-red-400/15 text-red-200" : "bg-emerald-400/15 text-emerald-200"}`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#059669] disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

export function DataDiriForm({ siswa, jurusan }) {
  return (
    <ProfileForm action={simpanProfilSiswa}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Nama lengkap
          <input name="nama" required maxLength={100} defaultValue={siswa.nama} className={field} />
        </label>
        <label className={label}>NISN
          <input name="nisn" required inputMode="numeric" maxLength={10} defaultValue={siswa.nisn ?? ""} className={field} />
        </label>
        <label className={label}>Email
          <input name="email" type="email" required maxLength={150} defaultValue={siswa.email} className={field} />
        </label>
        <label className={label}>No. HP
          <input name="no_hp" required maxLength={20} defaultValue={siswa.no_hp ?? ""} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>Alamat
          <input name="alamat" maxLength={255} defaultValue={siswa.alamat ?? ""} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>Jurusan pilihan
          <select name="jurusan" required defaultValue={siswa.jurusan ?? ""} className={field}>
            <option value="" disabled>Pilih jurusan</option>
            {jurusan.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
    </ProfileForm>
  );
}

export function PasswordForm() {
  return (
    <ProfileForm action={gantiPasswordSiswa}>
      <label className={label}>Password lama
        <input name="passwordLama" type="password" required autoComplete="current-password" className={field} />
      </label>
      <label className={label}>Password baru
        <input name="passwordBaru" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={field} />
      </label>
      <label className={label}>Konfirmasi password
        <input name="konfirmasiPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={field} />
      </label>
    </ProfileForm>
  );
}
