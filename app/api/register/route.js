import pool from "../../../lib/db";
import bcrypt from "bcryptjs";
import { JURUSAN } from "../../../lib/school";

const bad = (message, status = 400) => Response.json({ message }, { status });

export async function POST(request) {
  try {
    const body = await request.json();
    const nama = body.nama?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const alamat = body.alamat?.trim();
    const tanggalLahir = body.tanggal_lahir;
    const nisn = body.nisn?.trim();
    const jurusan = body.jurusan;
    const noHp = body.no_hp?.trim();

    if (
      !nama || !email || typeof password !== "string" ||
      !alamat || !tanggalLahir || !nisn || !jurusan || !noHp
    ) {
      return bad("Semua kolom wajib diisi.");
    }
    if (nama.length > 100 || email.length > 150 || alamat.length > 255) {
      return bad("Nama, email, atau alamat terlalu panjang.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return bad("Format email tidak valid.");
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return bad("Password minimal 8 karakter.");
    }
    if (!/^\d{10}$/.test(nisn)) return bad("NISN harus 10 digit angka.");
    if (!/^[0-9+\-\s]{8,20}$/.test(noHp)) return bad("Format nomor HP tidak valid.");
    if (!JURUSAN.some((j) => j.name === jurusan)) return bad("Jurusan tidak valid.");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir) ||
      Number.isNaN(Date.parse(tanggalLahir)) ||
      Date.parse(tanggalLahir) > Date.now()
    ) {
      return bad("Tanggal lahir tidak valid.");
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) return bad("Email sudah terdaftar.", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    // users + pendaftar + pembayaran dibuat bersamaan (transaksi)
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Role ditentukan oleh server, bukan oleh form.
      const [result] = await conn.query(
        "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'calon_siswa')",
        [nama, email, hashedPassword]
      );
      const userId = result.insertId;

      await conn.query(
        `INSERT INTO pendaftar (user_id, nisn, alamat, tanggal_lahir, jurusan, no_hp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, nisn, alamat, tanggalLahir, jurusan, noHp]
      );
      await conn.query("INSERT INTO pembayaran (user_id) VALUES (?)", [userId]);

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }

    return Response.json(
      { message: "Registrasi calon siswa berhasil." },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const dupNisn = String(error.sqlMessage ?? "").includes("nisn");
      return bad(dupNisn ? "NISN sudah terdaftar." : "Email sudah terdaftar.", 409);
    }

    console.error("Register error:", error);
    return bad("Terjadi kesalahan pada server.", 500);
  }
}
