-- Jalankan di HeidiSQL (tab Query) setelah memilih database project SPMB.

-- A. Kalau tabel users BELUM ada:
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('calon_siswa', 'admin', 'kepsek') NOT NULL DEFAULT 'calon_siswa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B. Kalau tabel users SUDAH ada dengan enum 2 pilihan, jangan CREATE lagi. Pakai ini:
-- ALTER TABLE users
--   MODIFY role ENUM('calon_siswa', 'admin', 'kepsek') NOT NULL DEFAULT 'calon_siswa';

-- Cek hasilnya:
-- DESCRIBE users;
