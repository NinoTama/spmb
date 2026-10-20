"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import pool from "../../../lib/db";
import { requireRole } from "../../../lib/auth";
import { deleteStored } from "../../../lib/storage";
import { JURUSAN } from "../../../lib/school";

// Setiap aksi memeriksa role admin di server, bukan hanya menyembunyikan tombol.

async function isSiswa(userId) {
  if (!Number.isInteger(userId)) return false;
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE id = ? AND role = 'calon_siswa'",
    [userId]
  );
  return rows.length > 0;
}

const refresh = () => revalidatePath("/dashboard", "layout");

// ---- Profil siswa ----
export async function editProfilSiswa(formData) {
  await requireRole("admin");

  const userId = Number(formData.get("userId"));
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nisnInput = String(formData.get("nisn") ?? "").trim();
  const alamatInput = String(formData.get("alamat") ?? "").trim();
  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim();
  const jurusan = String(formData.get("jurusan") ?? "").trim();
  const noHpInput = String(formData.get("no_hp") ?? "").trim();

  if (!Number.isInteger(userId) || userId < 1) {
    return { error: "Data siswa tidak valid." };
  }
  if (!nama || nama.length > 100 || !email || email.length > 150) {
    return { error: "Nama dan email wajib diisi dengan panjang yang valid." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }
  if (password && (password.length < 8 || Buffer.byteLength(password, "utf8") > 72)) {
    return { error: "Password baru minimal 8 karakter dan maksimal 72 byte." };
  }
  if (nisnInput && !/^\d{10}$/.test(nisnInput)) {
    return { error: "NISN harus 10 digit angka." };
  }
  if (alamatInput.length > 255) {
    return { error: "Alamat maksimal 255 karakter." };
  }
  if (noHpInput && !/^[0-9+\-\s]{8,20}$/.test(noHpInput)) {
    return { error: "Format nomor HP tidak valid." };
  }
  if (jurusan && !JURUSAN.some((item) => item.name === jurusan)) {
    return { error: "Jurusan tidak valid." };
  }
  if (tanggalLahir) {
    const [year, month, day] = tanggalLahir.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir) ||
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day ||
      tanggalLahir > todayString
    ) {
      return { error: "Tanggal lahir tidak valid." };
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query(
      "SELECT id FROM users WHERE id = ? AND role = 'calon_siswa' FOR UPDATE",
      [userId]
    );
    if (users.length === 0) {
      await connection.rollback();
      return { error: "Siswa tidak ditemukan." };
    }

    const passwordHash = password ? await bcrypt.hash(password, 12) : null;
    await connection.query(
      `UPDATE users SET nama = ?, email = ?
       ${passwordHash ? ", password = ?" : ""}
       WHERE id = ? AND role = 'calon_siswa'`,
      passwordHash
        ? [nama, email, passwordHash, userId]
        : [nama, email, userId]
    );
    await connection.query(
      `INSERT INTO pendaftar (user_id, nisn, alamat, tanggal_lahir, jurusan, no_hp)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nisn = VALUES(nisn), alamat = VALUES(alamat),
         tanggal_lahir = VALUES(tanggal_lahir), jurusan = VALUES(jurusan), no_hp = VALUES(no_hp)`,
      [
        userId,
        nisnInput || null,
        alamatInput || null,
        tanggalLahir || null,
        jurusan || null,
        noHpInput || null,
      ]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      const message = String(error.sqlMessage ?? "").toLowerCase();
      return {
        error: message.includes("nisn") ? "NISN sudah digunakan siswa lain." : "Email sudah digunakan akun lain.",
      };
    }
    throw error;
  } finally {
    connection.release();
  }

  refresh();
  return { ok: true };
}

// ---- Verifikasi pendaftar ----
export async function ubahStatusPendaftar(formData) {
  await requireRole("admin");
  const userId = Number(formData.get("userId"));
  const status = String(formData.get("status"));
  if (!["menunggu", "diterima", "ditolak"].includes(status)) return;
  if (!(await isSiswa(userId))) return;

  await pool.query(
    `INSERT INTO pendaftar (user_id, status) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [userId, status]
  );
  refresh();
}

// ---- Pembayaran ----
export async function ubahStatusBayar(formData) {
  await requireRole("admin");
  const userId = Number(formData.get("userId"));
  const aksi = String(formData.get("aksi"));
  if (!(await isSiswa(userId))) return;

  if (aksi === "terima") {
    await pool.query(
      `INSERT INTO pembayaran (user_id, status) VALUES (?, 'lunas')
       ON DUPLICATE KEY UPDATE status = 'lunas', diingatkan_at = NULL`,
      [userId]
    );
  } else if (aksi === "tolak") {
    // Ditolak: kembali ke "belum bayar" dan bukti dihapus supaya siswa mengunggah ulang
    const [rows] = await pool.query(
      "SELECT bukti_file FROM pembayaran WHERE user_id = ?",
      [userId]
    );
    await pool.query(
      `UPDATE pembayaran
       SET status = 'belum_bayar', bukti_file = NULL, bukti_mime = NULL, metode = NULL
       WHERE user_id = ?`,
      [userId]
    );
    await deleteStored("bukti", rows[0]?.bukti_file);
  }
  refresh();
}

export async function ingatkan(formData) {
  await requireRole("admin");
  const userId = Number(formData.get("userId"));
  if (!(await isSiswa(userId))) return;

  await pool.query("INSERT IGNORE INTO pembayaran (user_id) VALUES (?)", [userId]);
  await pool.query(
    "UPDATE pembayaran SET diingatkan_at = NOW() WHERE user_id = ? AND status = 'belum_bayar'",
    [userId]
  );
  refresh();
}

// ---- Batas pembayaran ----
export async function simpanBatasPembayaran(formData) {
  await requireRole("admin");
  const batas = String(formData.get("batasPembayaran") ?? "").trim();
  let nilai = null;

  if (batas) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(batas);
    if (!match) return { error: "Pilih tanggal dan jam tenggat yang valid." };

    const [, year, month, day, hour, minute] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day ||
      date.getUTCHours() !== hour ||
      date.getUTCMinutes() !== minute
    ) {
      return { error: "Tanggal dan jam tenggat tidak valid." };
    }
    nilai = `${batas.replace("T", " ")}:00`;
  }

  await pool.query(
    `INSERT INTO pengaturan_pembayaran (id, batas_pembayaran)
     VALUES (1, ?)
     ON DUPLICATE KEY UPDATE batas_pembayaran = VALUES(batas_pembayaran)`,
    [nilai]
  );
  refresh();
  return { ok: true };
}

// ---- Soal tes ----
export async function simpanSoal(formData) {
  await requireRole("admin");

  const id = Number(formData.get("id")) || null;
  const pertanyaan = String(formData.get("pertanyaan") ?? "").trim();
  const mapel = String(formData.get("mapel") ?? "").trim();
  const tipe = String(formData.get("tipe") ?? "");

  if (!pertanyaan || !mapel || !["pilihan_ganda", "esai"].includes(tipe)) {
    return { error: "Mapel, tipe, dan pertanyaan wajib diisi." };
  }
  if (mapel.length > 50) return { error: "Nama mapel maksimal 50 karakter." };

  let opsi = [null, null, null, null];
  let kunci = null;
  if (tipe === "pilihan_ganda") {
    opsi = ["a", "b", "c", "d"].map((k) => String(formData.get(`opsi_${k}`) ?? "").trim());
    kunci = String(formData.get("kunci") ?? "").toUpperCase();
    if (opsi.some((o) => !o || o.length > 255) || !["A", "B", "C", "D"].includes(kunci)) {
      return { error: "Isi keempat opsi (maks. 255 karakter) dan pilih kunci jawaban." };
    }
  }

  if (id) {
    await pool.query(
      `UPDATE soal SET pertanyaan = ?, mapel = ?, tipe = ?,
         opsi_a = ?, opsi_b = ?, opsi_c = ?, opsi_d = ?, kunci = ?
       WHERE id = ?`,
      [pertanyaan, mapel, tipe, ...opsi, kunci, id]
    );
  } else {
    await pool.query(
      `INSERT INTO soal (pertanyaan, mapel, tipe, opsi_a, opsi_b, opsi_c, opsi_d, kunci)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [pertanyaan, mapel, tipe, ...opsi, kunci]
    );
  }
  refresh();
  return { ok: true };
}

function parseSoalCsv(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (quoted) {
      if (char === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
      if (char === "\r" && csv[index + 1] === "\n") index += 1;
    } else {
      field += char;
    }
  }

  if (quoted) return { error: "CSV tidak valid: ada tanda kutip yang belum ditutup." };
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return { rows };
}

export async function imporSoalCsv(csv) {
  await requireRole("admin");

  if (typeof csv !== "string" || !csv.trim()) {
    return { error: "Isi data CSV terlebih dahulu." };
  }
  if (Buffer.byteLength(csv, "utf8") > 1024 * 1024) {
    return { error: "Ukuran CSV maksimal 1 MB." };
  }

  const parsed = parseSoalCsv(csv.replace(/^\uFEFF/, ""));
  if (parsed.error) return parsed;
  const [header, ...data] = parsed.rows;
  const columns = ["mapel", "tipe", "pertanyaan", "opsi_a", "opsi_b", "opsi_c", "opsi_d", "kunci"];
  const headerNames = header?.map((value) => value.trim().toLowerCase()) ?? [];

  if (
    columns.some((column) => !headerNames.includes(column)) ||
    headerNames.length !== columns.length
  ) {
    return { error: `Header CSV harus berisi kolom: ${columns.join(", ")}.` };
  }
  if (data.length === 0) return { error: "CSV belum berisi data soal." };
  if (data.length > 200) return { error: "Maksimal 200 soal dapat diimpor sekaligus." };

  const positions = Object.fromEntries(columns.map((column) => [column, headerNames.indexOf(column)]));
  const questions = [];
  for (const [index, values] of data.entries()) {
    const line = index + 2;
    if (values.length !== columns.length) {
      return { error: `Baris ${line}: jumlah kolom tidak sesuai header.` };
    }

    const get = (name) => String(values[positions[name]] ?? "").trim();
    const mapel = get("mapel");
    const tipe = get("tipe").toLowerCase();
    const pertanyaan = get("pertanyaan");
    if (!mapel || mapel.length > 50 || !pertanyaan) {
      return { error: `Baris ${line}: mapel (maks. 50 karakter) dan pertanyaan wajib diisi.` };
    }
    if (tipe !== "pilihan_ganda" && tipe !== "esai") {
      return { error: `Baris ${line}: tipe harus pilihan_ganda atau esai.` };
    }

    let options = [null, null, null, null];
    let key = null;
    if (tipe === "pilihan_ganda") {
      options = ["opsi_a", "opsi_b", "opsi_c", "opsi_d"].map(get);
      key = get("kunci").toUpperCase();
      if (options.some((option) => !option || option.length > 255)) {
        return { error: `Baris ${line}: semua opsi wajib diisi dan maksimal 255 karakter.` };
      }
      if (!["A", "B", "C", "D"].includes(key)) {
        return { error: `Baris ${line}: kunci harus A, B, C, atau D.` };
      }
    }

    questions.push([pertanyaan, mapel, tipe, ...options, key]);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO soal (pertanyaan, mapel, tipe, opsi_a, opsi_b, opsi_c, opsi_d, kunci)
       VALUES ?`,
      [questions]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  refresh();
  return { ok: true, count: questions.length };
}

export async function hapusSoal(formData) {
  await requireRole("admin");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await pool.query("DELETE FROM soal WHERE id = ?", [id]);
  refresh();
}
