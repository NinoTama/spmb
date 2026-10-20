Urutan pemasangan:
1. Jalankan sql/spmb-tables.sql di HeidiSQL (database spmbb). Jalankan ulang skrip ini untuk membuat tabel pengaturan batas pembayaran.
2. Salin semua isi folder ini ke project (timpa file yang sama).
3. Tambahkan baris  /storage  ke file .gitignore (di situ file upload disimpan).
4. Restart npm run dev.

Mengatur tenggat pembayaran:
- Login sebagai admin, buka menu Pembayaran, lalu atur tanggal dan jam pada bagian Batas Pembayaran Siswa.
- Siswa yang belum membayar setelah tenggat akan melihat peringatan, tetapi tetap bisa membayar.
- Kosongkan dan simpan (atau klik Hapus Tenggat) untuk menghapus batas waktu.
