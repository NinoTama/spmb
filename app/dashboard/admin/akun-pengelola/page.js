import pool from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import Topbar from "../../../../components/admin/Topbar";
import StaffAccountManager from "../../../../components/admin/StaffAccountManager";
import { tableWrap, th, td } from "../../../../components/ui";
import { tanggal } from "../../../../lib/format";

export default async function AkunPengelolaPage() {
  const session = await requireRole("admin");
  const [accounts] = await pool.query(
    `SELECT id, nama, email, role, created_at
     FROM users
     WHERE role IN ('admin', 'kepsek')
     ORDER BY created_at DESC, id DESC`
  );

  return (
    <>
      <Topbar title="Akun Pengelola" nama={session.nama} />
      <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold">Tambah Akun Pengelola</h2>
          <p className="mt-1 text-sm text-slate-600">
            Buat akun untuk admin atau kepala sekolah. Akun dapat langsung digunakan untuk masuk.
          </p>
          <StaffAccountManager />
        </section>

        <section className={tableWrap}>
          <div className="px-5 py-4">
            <h2 className="font-bold">Daftar Akun Pengelola</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>No</th>
                <th className={th}>Nama</th>
                <th className={th}>Email</th>
                <th className={th}>Role</th>
                <th className={th}>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className={`${td} text-center text-white/60`}>
                    Belum ada akun pengelola.
                  </td>
                </tr>
              )}
              {accounts.map((account, index) => (
                <tr key={account.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className={td}>{index + 1}</td>
                  <td className={`${td} font-semibold`}>{account.nama}</td>
                  <td className={td}>{account.email}</td>
                  <td className={td}>{account.role === "kepsek" ? "Kepala Sekolah" : "Admin"}</td>
                  <td className={td}>{tanggal(account.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
