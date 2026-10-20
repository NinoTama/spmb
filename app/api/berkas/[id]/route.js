import pool from "../../../../lib/db";
import { currentSession } from "../../../../lib/auth";
import { readStored } from "../../../../lib/storage";

// Membuka berkas: hanya admin atau pemilik berkas
export async function GET(request, { params }) {
  const session = await currentSession();
  if (!session) return new Response("Belum login.", { status: 401 });

  const { id } = await params;
  const [rows] = await pool.query(
    "SELECT user_id, file, mime, nama_asli FROM berkas WHERE id = ?",
    [Number(id)]
  );
  const row = rows[0];
  if (!row) return new Response("Berkas tidak ditemukan.", { status: 404 });

  const boleh =
    session.role === "admin" ||
    (session.role === "calon_siswa" && Number(session.sub) === row.user_id);
  if (!boleh) return new Response("Tidak diizinkan.", { status: 403 });

  try {
    const data = await readStored("berkas", row.file);
    return new Response(data, {
      headers: {
        "Content-Type": row.mime,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.nama_asli)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File tidak ada di server.", { status: 404 });
  }
}
