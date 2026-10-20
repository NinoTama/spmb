import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_HOME } from "./roles";

export const SESSION_COOKIE = "spmb_session";

// Membaca dan memverifikasi token sesi. Mengembalikan payload, atau null kalau tidak valid.
export async function getSession(token) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 32) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );
    return payload;
  } catch {
    return null;
  }
}

// Sesi dari cookie request saat ini (untuk halaman, server action, dan API route).
export async function currentSession() {
  const store = await cookies();
  return getSession(store.get(SESSION_COOKIE)?.value);
}

// Dipakai di setiap halaman dan aksi privat.
// - belum login           -> diarahkan ke /login
// - login tapi salah role -> diarahkan ke dashboard miliknya sendiri
export async function requireRole(allowedRole) {
  const session = await currentSession();

  if (!session) redirect("/login");
  if (session.role !== allowedRole) {
    redirect(ROLE_HOME[session.role] ?? "/login");
  }
  return session;
}
