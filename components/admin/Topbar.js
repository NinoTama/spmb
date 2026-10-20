import { Icon } from "../Icons";

// search: { action, placeholder, value } (opsional). Form GET biasa, tanpa JavaScript.
export default function Topbar({ title, nama = "Admin", search }) {
  return (
    <header className="flex flex-wrap items-center gap-3 bg-[#123223] px-4 py-4 text-white sm:gap-4 sm:px-6 sm:py-5 lg:px-8">
      <h1 className="text-lg font-bold sm:text-xl">{title}</h1>

      {search && (
        <form action={search.action} className="relative w-full max-w-sm sm:ml-2">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            name="q"
            defaultValue={search.value ?? ""}
            placeholder={search.placeholder}
            className="w-full rounded-lg bg-[#1E4A34] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/50 focus:ring-2 focus:ring-emerald-400/60"
          />
        </form>
      )}

      <div className="ml-auto flex items-center gap-4 text-sm">
        <span className="rounded-lg bg-white/10 p-2">
          <Icon name="bell" className="h-4 w-4" />
        </span>
        <span className="max-w-32 truncate font-semibold sm:max-w-none">{nama}</span>
      </div>
    </header>
  );
}
