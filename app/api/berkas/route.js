import pool from "../../../lib/db";
import { currentSession } from "../../../lib/auth";
import { saveUpload, deleteStored } from "../../../lib/storage";
import { JENIS_BERKAS } from "../../../lib/format";

// Calon siswa mengunggah (atau mengganti) berkas pendaftaran
export async function POST(request) {
  try {
    const session = await currentSession();
    if (!session || session.role !== "calon_siswa") {
      return Response.json({ message: "Tidak diizinkan." }, { status: 403 });
    }
    const userId = Number(session.sub);

    const form = await request.formData();
    const jenis = String(form.get("jenis") ?? "");
    if (!Object.hasOwn(JENIS_BERKAS, jenis)) {
      return Response.json({ message: "Jenis berkas tidak valid." }, { status: 400 });
    }

    let saved;
    try {
      saved = await saveUpload(form.get("file"), "berkas");
    } catch (error) {
      return Response.json({ message: error.message }, { status: 400 });
    }

    const [old] = await pool.query(
      "SELECT file FROM berkas WHERE user_id = ? AND jenis = ?",
      [userId, jenis]
    );

    await pool.query(
      `INSERT INTO berkas (user_id, jenis, nama_asli, file, mime)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nama_asli = VALUES(nama_asli), file = VALUES(file),
                               mime = VALUES(mime), uploaded_at = CURRENT_TIMESTAMP`,
      [userId, jenis, saved.original, saved.stored, saved.mime]
    );
    await deleteStored("berkas", old[0]?.file);

    return Response.json({ message: "Berkas berhasil diunggah." }, { status: 201 });
  } catch (error) {
    console.error("Upload berkas error:", error);
    return Response.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
