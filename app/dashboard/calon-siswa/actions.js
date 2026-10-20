"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import pool from "../../../lib/db";
import { requireRole } from "../../../lib/auth";
import { JURUSAN } from "../../../lib/school";

export async function simpanProfilSiswa(formData) {
  const session = await requireRole("calon_siswa");
  const userId = Number(session.sub);
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nisn = String(formData.get("nisn") ?? "").trim();
  const noHp = String(formData.get("no_hp") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  const jurusan = String(formData.get("jurusan") ?? "").trim();

  if (!nama || nama.length > 100 || !email || email.length > 150) {
    return { error: "Nama dan email wajib diisi dengan panjang yang valid." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }
  if (!/^\d{10}$/.test(nisn)) return { error: "NISN harus 10 digit angka." };
  if (!/^[0-9+\-\s]{8,20}$/.test(noHp)) return { error: "Format nomor HP tidak valid." };
  if (alamat.length > 255) return { error: "Alamat maksimal 255 karakter." };
  if (!JURUSAN.some((item) => item.name === jurusan)) {
    return { error: "Pilih jurusan yang tersedia." };
  }

  try {
    await pool.query(
      `UPDATE users u
       JOIN pendaftar p ON p.user_id = u.id
       SET u.nama = ?, u.email = ?, p.nisn = ?, p.no_hp = ?, p.alamat = ?, p.jurusan = ?
       WHERE u.id = ? AND u.role = 'calon_siswa'`,
      [nama, email, nisn, noHp, alamat || null, jurusan, userId]
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const detail = String(error.sqlMessage ?? "").toLowerCase();
      return {
        error: detail.includes("nisn")
          ? "NISN sudah digunakan akun lain."
          : "Email sudah digunakan akun lain.",
      };
    }
    throw error;
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function gantiPasswordSiswa(formData) {
  const session = await requireRole("calon_siswa");
  const userId = Number(session.sub);
  const passwordLama = String(formData.get("passwordLama") ?? "");
  const passwordBaru = String(formData.get("passwordBaru") ?? "");
  const konfirmasi = String(formData.get("konfirmasiPassword") ?? "");

  if (!passwordLama || !passwordBaru || !konfirmasi) {
    return { error: "Semua kolom password wajib diisi." };
  }
  if (passwordBaru.length < 8 || Buffer.byteLength(passwordBaru, "utf8") > 72) {
    return { error: "Password baru minimal 8 karakter dan maksimal 72 byte." };
  }
  if (passwordBaru !== konfirmasi) return { error: "Konfirmasi password baru tidak cocok." };
  if (passwordLama === passwordBaru) return { error: "Password baru harus berbeda dari password lama." };

  const [rows] = await pool.query(
    "SELECT password FROM users WHERE id = ? AND role = 'calon_siswa'",
    [userId]
  );
  if (!rows[0] || !(await bcrypt.compare(passwordLama, rows[0].password))) {
    return { error: "Password lama tidak sesuai." };
  }

  const passwordHash = await bcrypt.hash(passwordBaru, 12);
  await pool.query(
    "UPDATE users SET password = ? WHERE id = ? AND role = 'calon_siswa'",
    [passwordHash, userId]
  );
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// Mengirim jawaban tes. Syarat dicek di server:
// pembayaran harus sudah dikonfirmasi admin (lunas) dan tes hanya bisa dikirim sekali.
export async function kirimJawaban(formData) {
  const session = await requireRole("calon_siswa");
  const userId = Number(session.sub);

  const [pay] = await pool.query("SELECT status FROM pembayaran WHERE user_id = ?", [userId]);
  if (pay[0]?.status !== "lunas") {
    return { error: "Pembayaran belum dikonfirmasi admin, tes belum bisa dikerjakan." };
  }

  const [sudah] = await pool.query("SELECT id FROM hasil_tes WHERE user_id = ?", [userId]);
  if (sudah.length > 0) return { error: "Kamu sudah mengirim jawaban." };

  const [soal] = await pool.query("SELECT id, tipe, kunci FROM soal");
  if (soal.length === 0) return { error: "Belum ada soal." };

  let skor = 0;
  let total = 0;
  const rows = soal.map((s) => {
    const jawab = String(formData.get(`soal_${s.id}`) ?? "").trim().slice(0, 5000);
    if (s.tipe === "pilihan_ganda") {
      total += 1;
      if (jawab.toUpperCase() === s.kunci) skor += 1;
    }
    return [userId, s.id, jawab];
  });

  await pool.query(
    `INSERT INTO jawaban (user_id, soal_id, jawaban) VALUES ?
     ON DUPLICATE KEY UPDATE jawaban = VALUES(jawaban)`,
    [rows]
  );
  await pool.query(
    "INSERT INTO hasil_tes (user_id, skor_pg, total_pg) VALUES (?, ?, ?)",
    [userId, skor, total]
  );

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
