import Link from "next/link";
import LoginForm from "../../../components/LoginForm";

export default async function PageStudent({ searchParams }) {
  const params = await searchParams;
  return (
    <LoginForm
      role="student"
      title="Login Siswa"
      subtitle="Masuk untuk melihat status pendaftaran"
      notice={params.created === "1" ? "Pendaftaran akun siswa berhasil. Silakan masuk dengan email dan password yang baru dibuat." : ""}
      emailLabel="Email"
      emailPlaceholder="nama@domain.com"
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="rounded bg-[#123223] px-2 py-1 text-white"
          >
            Daftar
          </Link>
          <span className="mt-2 block">
            Masuk sebagai{" "}
            <Link href="/login/admin" className="text-[#123223] underline">admin</Link>
            {" atau "}
            <Link href="/login/principal" className="text-[#123223] underline">kepala sekolah</Link>
          </span>
        </>
      }
    />
  );
}
