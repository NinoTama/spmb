import LoginForm from "../../../components/LoginForm";
import Link from "next/link";

export default async function PagePrincipal({ searchParams }) {
  const params = await searchParams;
  return (
    <LoginForm
      role="principal"
      title="Login Kepala Sekolah"
      subtitle="Masuk untuk meninjau dan menyetujui hasil seleksi"
      emailPlaceholder="kepsek@school.sch.id"
      notice={params.created === "1" ? "Akun kepala sekolah berhasil dibuat. Silakan masuk dengan email dan password akun tersebut." : ""}
      footer={
        <>
          Lupa password? Hubungi IT Support
          <span className="mt-2 block">
            <Link href="/login/student" className="text-[#123223] underline">Login siswa</Link>
            {" · "}
            <Link href="/login/admin" className="text-[#123223] underline">Login admin</Link>
          </span>
        </>
      }
    />
  );
}
