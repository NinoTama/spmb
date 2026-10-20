import Link from "next/link";
import { Icon } from "../Icons";

export default function StudentTopbar({ title, nama }) {
  return (
    <header className="flex min-h-14 items-center gap-3 bg-[#18373D] px-4 py-3 text-white sm:min-h-16 sm:gap-4 sm:px-8 sm:py-4">
      <h1 className="text-base font-bold sm:text-lg">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <span aria-hidden="true" className="rounded-lg border border-white/10 p-2 text-emerald-200">
          <Icon name="bell" className="h-4 w-4" />
        </span>
        <Link href="/dashboard/calon-siswa/profil" className="max-w-32 truncate text-xs font-semibold text-white/80 hover:text-white sm:max-w-none">
          {nama}
        </Link>
      </div>
    </header>
  );
}
