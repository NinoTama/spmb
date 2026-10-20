import pool from "./db";
import { requireRole } from "./auth";

// Dipakai semua halaman calon siswa: cek role, pastikan barisnya ada, ambil ringkasan data.
export async function getStudentContext() {
  const session = await requireRole("calon_siswa");
  const userId = Number(session.sub);

  await pool.query("INSERT IGNORE INTO pendaftar (user_id) VALUES (?)", [userId]);
  await pool.query("INSERT IGNORE INTO pembayaran (user_id) VALUES (?)", [userId]);

  const [rows] = await pool.query(
    `SELECT u.id, u.nama, u.email, p.nisn, p.jurusan, p.status, p.alamat, p.no_hp,
            pay.nominal, pay.metode, pay.bukti_file, pay.diingatkan_at,
            pay.status AS bayar,
            settings.batas_pembayaran,
            DATE_FORMAT(settings.batas_pembayaran, '%d %b %Y pukul %H:%i') AS batas_pembayaran_label,
            (pay.status = 'belum_bayar' AND settings.batas_pembayaran IS NOT NULL
              AND NOW() > settings.batas_pembayaran) AS pembayaran_terlambat
     FROM users u
     JOIN pendaftar p ON p.user_id = u.id
     JOIN pembayaran pay ON pay.user_id = u.id
     LEFT JOIN pengaturan_pembayaran settings ON settings.id = 1
     WHERE u.id = ?`,
    [userId]
  );

  return { session, userId, me: rows[0] };
}
