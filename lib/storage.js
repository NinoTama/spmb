import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// File disimpan di folder storage/ (di luar public/), jadi hanya bisa dibuka lewat API
// yang memeriksa login dan role.
const ROOT = path.join(process.cwd(), "storage");

export const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function saveUpload(file, subdir) {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new Error("File belum dipilih.");
  }
  if (file.size > MAX_SIZE) throw new Error("Ukuran file maksimal 5 MB.");

  const ext = path.extname(file.name).toLowerCase();
  const mime = ALLOWED[ext];
  if (!mime) throw new Error("Format file harus PDF, JPG, atau PNG.");

  const dir = path.join(ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });

  const stored = crypto.randomUUID() + ext;
  await fs.writeFile(path.join(dir, stored), Buffer.from(await file.arrayBuffer()));

  return { stored, mime, original: file.name.slice(0, 255) };
}

export async function readStored(subdir, stored) {
  return fs.readFile(path.join(ROOT, subdir, path.basename(stored)));
}

export async function deleteStored(subdir, stored) {
  if (!stored) return;
  try {
    await fs.unlink(path.join(ROOT, subdir, path.basename(stored)));
  } catch {
    // file sudah tidak ada, abaikan
  }
}
