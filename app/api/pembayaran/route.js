import pool from "../../../lib/db";
import { currentSession } from "../../../lib/auth";
import { saveUpload, deleteStored } from "../../../lib/storage";

const METODE = ["VA BCA", "QRIS"];

// Calon siswa mengirim bukti pembayaran -> status menjadi "menunggu_konfirmasi"
export async function POST(request) {
  try {
    const session = await currentSession();
    if (!session || session.role !== "calon_siswa") {
      return Response.json({ message: "Tidak diizinkan." }, { status: 403 });
    }
    const userId = Number(session.sub);

    const form = await request.formData();
    const metode = String(form.get("metode") ?? "");
    if (!METODE.includes(metode)) {
      return Response.json({ message: "Pilih metode pembayaran." }, { status: 400 });
    }

    const [rows] = await pool.query(
      "SELECT status, bukti_file FROM pembayaran WHERE user_id = ?",
      [userId]
    );
    if (rows[0]?.status === "lunas") {
      return Response.json({ message: "Pembayaran sudah lunas." }, { status: 409 });
    }

    let saved;
    try {
      saved = await saveUpload(form.get("file"), "bukti");
    } catch (error) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO pembayaran (user_id, metode, bukti_file, bukti_mime, status)
       VALUES (?, ?, ?, ?, 'menunggu_konfirmasi')
       ON DUPLICATE KEY UPDATE metode = VALUES(metode), bukti_file = VALUES(bukti_file),
                               bukti_mime = VALUES(bukti_mime),
                               status = 'menunggu_konfirmasi', diingatkan_at = NULL`,
      [userId, metode, saved.stored, saved.mime]
    );
    await deleteStored("bukti", rows[0]?.bukti_file);

    return Response.json(
      { message: "Bukti pembayaran terkirim. Menunggu konfirmasi admin." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pembayaran error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
