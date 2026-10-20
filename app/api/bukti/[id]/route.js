import pool from "../../../../lib/db";
import { currentSession } from "../../../../lib/auth";
import { readStored } from "../../../../lib/storage";

// Membuka bukti pembayaran milik user dengan id tertentu: hanya admin atau pemiliknya
export async function GET(request, { params }) {
  const session = await currentSession();
  if (!session) return new Response("Belum login.", { status: 401 });

  const { id } = await params;
  const userId = Number(id);

  const boleh =
    session.role === "admin" ||
    (session.role === "calon_siswa" && Number(session.sub) === userId);
  if (!boleh) return new Response("Tidak diizinkan.", { status: 403 });

  const [rows] = await pool.query(
    "SELECT bukti_file, bukti_mime FROM pembayaran WHERE user_id = ?",
    [userId]
  );
  const row = rows[0];
  if (!row?.bukti_file) return new Response("Bukti belum ada.", { status: 404 });

  try {
    const data = await readStored("bukti", row.bukti_file);
    return new Response(data, {
      headers: {
        "Content-Type": row.bukti_mime,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File tidak ada di server.", { status: 404 });
  }
}
