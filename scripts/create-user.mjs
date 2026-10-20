// Membuat akun admin / kepsek (dijalankan oleh pengelola, bukan lewat form).
//
// PowerShell (Windows):
//   $env:INITIAL_USER_PASSWORD="PasswordKuat123"
//   node --env-file=.env.local scripts/create-user.mjs "Petugas SPMB" admin@school.sch.id admin
//   node --env-file=.env.local scripts/create-user.mjs "Kepala Sekolah" kepsek@school.sch.id kepsek
//
// Butuh Node.js 20.6 atau lebih baru (cek: node -v). Hapus file ini setelah akun dibuat.

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const [, , nama, emailArg, role] = process.argv;
const email = emailArg?.toLowerCase();
const password = process.env.INITIAL_USER_PASSWORD;

async function createUser() {
  if (
    !nama ||
    !email ||
    !["admin", "kepsek"].includes(role) ||
    !password ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new Error(
      "Isi nama, email, role (admin/kepsek), dan INITIAL_USER_PASSWORD (minimal 8 karakter)."
    );
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME,
  });

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.execute(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, hashedPassword, role]
    );
    console.log(`Akun ${role} berhasil dibuat: ${email}`);
  } finally {
    await db.end();
  }
}

createUser().catch((error) => {
  console.error("Gagal membuat akun:", error.message);
  process.exitCode = 1;
});
