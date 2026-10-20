-- Jalankan di HeidiSQL (tab Query, database spmbb). Tabel users sudah ada.

CREATE TABLE IF NOT EXISTS pendaftar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nisn VARCHAR(10) NULL UNIQUE,
  alamat VARCHAR(255) NULL,
  tanggal_lahir DATE NULL,
  jurusan VARCHAR(100) NULL,
  no_hp VARCHAR(20) NULL,
  status ENUM('menunggu', 'diterima', 'ditolak') NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS berkas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  jenis ENUM('kartu_keluarga', 'ijazah', 'raport') NOT NULL,
  nama_asli VARCHAR(255) NOT NULL,
  file VARCHAR(100) NOT NULL,
  mime VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_berkas (user_id, jenis),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nominal INT NOT NULL DEFAULT 350000,
  metode ENUM('VA BCA', 'QRIS') NULL,
  bukti_file VARCHAR(100) NULL,
  bukti_mime VARCHAR(100) NULL,
  status ENUM('belum_bayar', 'menunggu_konfirmasi', 'lunas') NOT NULL DEFAULT 'belum_bayar',
  diingatkan_at DATETIME NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pengaturan_pembayaran (
  id TINYINT PRIMARY KEY,
  batas_pembayaran DATETIME NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO pengaturan_pembayaran (id, batas_pembayaran) VALUES (1, NULL);

CREATE TABLE IF NOT EXISTS soal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  mapel VARCHAR(50) NOT NULL,
  tipe ENUM('pilihan_ganda', 'esai') NOT NULL,
  opsi_a VARCHAR(255) NULL,
  opsi_b VARCHAR(255) NULL,
  opsi_c VARCHAR(255) NULL,
  opsi_d VARCHAR(255) NULL,
  kunci CHAR(1) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jawaban (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  soal_id INT NOT NULL,
  jawaban TEXT NULL,
  UNIQUE KEY uq_jawaban (user_id, soal_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hasil_tes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  skor_pg INT NOT NULL DEFAULT 0,
  total_pg INT NOT NULL DEFAULT 0,
  dikirim_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pendaftar lama (akun siswa yang dibuat sebelum tabel ini ada) otomatis dibuatkan
-- barisnya saat mereka membuka dashboard. Boleh juga langsung diisi:
INSERT IGNORE INTO pendaftar (user_id) SELECT id FROM users WHERE role = 'calon_siswa';
INSERT IGNORE INTO pembayaran (user_id) SELECT id FROM users WHERE role = 'calon_siswa';
