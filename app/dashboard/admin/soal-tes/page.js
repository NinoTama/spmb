import pool from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import Topbar from "../../../../components/admin/Topbar";
import SoalManager from "../../../../components/admin/SoalManager";

export default async function SoalTes() {
  const session = await requireRole("admin");

  const [rows] = await pool.query(
    "SELECT id, pertanyaan, mapel, tipe, opsi_a, opsi_b, opsi_c, opsi_d, kunci FROM soal ORDER BY id"
  );
  // ubah ke objek biasa supaya bisa dikirim ke client component
  const soal = rows.map((r) => ({ ...r }));

  return (
    <>
      <Topbar title="Soal Tes" nama={session.nama} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <SoalManager soal={soal} />
      </main>
    </>
  );
}
