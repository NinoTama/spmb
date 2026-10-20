import bcrypt from "bcryptjs";
import { currentSession } from "../../../../lib/auth";
import pool from "../../../../lib/db";

const bad = (message, status = 400) => Response.json({ message }, { status });

export async function POST(request) {
  const session = await currentSession();
  if (!session) return bad("Silakan masuk terlebih dahulu.", 401);
  if (session.role !== "admin") return bad("Hanya admin yang dapat membuat akun pengelola.", 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Data permintaan tidak valid.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return bad("Data permintaan tidak valid.");
  }

  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  const role = body.role;

  if (!nama || !email || typeof password !== "string" || !role) {
    return bad("Nama, email, password, dan role wajib diisi.");
  }
  if (nama.length > 100 || email.length > 150) {
    return bad("Nama maksimal 100 karakter dan email maksimal 150 karakter.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return bad("Format email tidak valid.");
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return bad("Password harus minimal 8 karakter dan maksimal 72 byte.");
  }
  if (role !== "admin" && role !== "kepsek") {
    return bad("Role akun tidak valid.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, hashedPassword, role]
    );

    return Response.json(
      { message: `Akun ${role === "kepsek" ? "kepala sekolah" : "admin"} berhasil dibuat.` },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return bad("Email sudah digunakan akun lain.", 409);
    }
    console.error("Create staff account error:", error);
    return bad("Terjadi kesalahan pada server.", 500);
  }
}
