import LoginForm from "../../../components/LoginForm";
import Link from "next/link";

export default async function PageAdmin({ searchParams }) {
  const params = await searchParams;
  return (
    <LoginForm
      role="admin"
      title="Login Admin"
      subtitle="Masuk ke dashboard admin SPMB"
      emailPlaceholder="admin@school.sch.id"
      notice={params.created === "1" ? "Akun admin berhasil dibuat. Silakan masuk dengan email dan password akun tersebut." : ""}
      footer={
        <>
          Lupa password? Hubungi IT Support
          <span className="mt-2 block">
            <Link href="/login/student" className="text-[#123223] underline">Login siswa</Link>
            {" · "}
            <Link href="/login/principal" className="text-[#123223] underline">Login kepala sekolah</Link>
          </span>
        </>
      }
    />
  );
}
