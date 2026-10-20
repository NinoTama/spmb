export async function POST() {
  const response = Response.json({ message: "Logout berhasil." });
  // Max-Age=0 menghapus cookie sesi
  response.headers.append(
    "Set-Cookie",
    "spmb_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
  );
  return response;
}
