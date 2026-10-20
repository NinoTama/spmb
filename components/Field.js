"use client";

import { useState } from "react";
import { Icon } from "./Icons";

export default function Field({
  label,
  icon,
  name,
  type = "text",
  placeholder,
  options,
  className = "",
  ...rest
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  const base =
    "w-full rounded-xl border border-[#123223]/60 bg-[#3F7D66] py-3 pl-10 text-sm text-white shadow-sm transition placeholder:text-[#DFE6D4]/80 hover:bg-[#3a7360] focus:border-[#123223] focus:outline-none focus:ring-2 focus:ring-[#15803D]/50 [color-scheme:dark]";

  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-semibold text-[#526E5D]">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white">
          <Icon name={icon} />
        </span>

        {options ? (
          <>
            <select
              name={name}
              required
              defaultValue=""
              className={`${base} appearance-none pr-10`}
              {...rest}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((o) => (
                <option key={o} value={o} className="text-black">
                  {o}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">
              <Icon name="chevron" />
            </span>
          </>
        ) : (
          <input
            name={name}
            required
            type={isPassword && show ? "text" : type}
            placeholder={placeholder}
            className={`${base} ${isPassword ? "pr-10" : "pr-3"}`}
            {...rest}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
          >
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        )}
      </span>
    </label>
  );
}
