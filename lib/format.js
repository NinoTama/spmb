export const rupiah = (n) => "Rp " + Number(n ?? 0).toLocaleString("id-ID");

export function tanggal(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const JENIS_BERKAS = {
  kartu_keluarga: "Kartu Keluarga",
  ijazah: "Ijazah",
  raport: "Raport Semester 1-5",
};

// [label, warna]
export const STATUS_PENDAFTAR = {
  menunggu: ["Menunggu", "amber"],
  diterima: ["Diterima", "green"],
  ditolak: ["Ditolak", "red"],
};

export const STATUS_BAYAR = {
  belum_bayar: ["Belum Bayar", "gray"],
  menunggu_konfirmasi: ["Menunggu Konfirmasi", "amber"],
  lunas: ["Lunas", "green"],
};
