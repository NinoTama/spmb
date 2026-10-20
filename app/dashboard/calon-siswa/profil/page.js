import { getStudentContext } from "../../../../lib/student";
import { JURUSAN } from "../../../../lib/school";
import StudentTopbar from "../../../../components/student/StudentTopbar";
import { DataDiriForm, PasswordForm } from "../../../../components/student/ProfilSiswaForms";

const card = "rounded-2xl bg-[#06291D] p-5 text-white shadow-lg sm:p-6";

export default async function ProfilSiswa() {
  const { me } = await getStudentContext();
  const inisial = me.nama.trim().charAt(0).toUpperCase();

  return (
    <>
      <StudentTopbar title="Profil" nama={me.nama} />
      <main className="flex-1 space-y-5 p-5 sm:p-8">
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
          <section className={card}>
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#10B981] text-lg font-extrabold">
                {inisial}
              </span>
              <div>
                <h2 className="font-bold">{me.nama}</h2>
                <p className="text-xs text-white/55">No. Pendaftaran: {String(me.id).padStart(8, "0")}</p>
              </div>
            </div>
            <h3 className="mb-4 font-bold">Data Pribadi</h3>
            <DataDiriForm siswa={me} jurusan={JURUSAN.map((item) => item.name)} />
          </section>

          <section className={card}>
            <h2 className="mb-1 font-bold">Ganti Password</h2>
            <p className="mb-5 text-xs leading-5 text-white/55">
              Gunakan password lama untuk memverifikasi perubahan. Password baru minimal 8 karakter.
            </p>
            <PasswordForm />
          </section>
        </div>
      </main>
    </>
  );
}
