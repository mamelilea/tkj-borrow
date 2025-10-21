-- ============================================
-- Database Schema for TKJ Peminjaman Barang
-- ============================================

CREATE DATABASE IF NOT EXISTS db_peminjaman_tkj;
USE db_peminjaman_tkj;

-- ============================================
-- Tabel: barang
-- ============================================
CREATE TABLE IF NOT EXISTS barang (
  id_barang INT AUTO_INCREMENT PRIMARY KEY,
  kode_barang VARCHAR(20) UNIQUE NOT NULL,
  nama_barang VARCHAR(100) NOT NULL,
  jumlah_stok INT NOT NULL DEFAULT 0,
  jumlah_dipinjam INT NOT NULL DEFAULT 0,
  foto_barang VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kode_barang (kode_barang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: peminjaman
-- ============================================
CREATE TABLE IF NOT EXISTS peminjaman (
  id_peminjaman INT AUTO_INCREMENT PRIMARY KEY,
  kode_peminjaman VARCHAR(30) UNIQUE NOT NULL,
  id_barang INT NOT NULL,
  nama_peminjam VARCHAR(100) NOT NULL,
  kontak VARCHAR(20),
  keperluan TEXT NOT NULL,
  guru_pendamping VARCHAR(100) NOT NULL,
  jumlah INT NOT NULL,
  foto_credential VARCHAR(255),
  tanggal_pinjam DATETIME DEFAULT CURRENT_TIMESTAMP,
  tanggal_kembali DATETIME NULL,
  status ENUM('Dipinjam', 'Dikembalikan') DEFAULT 'Dipinjam',
  signature TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE RESTRICT,
  INDEX idx_kode_peminjaman (kode_peminjaman),
  INDEX idx_status (status),
  INDEX idx_tanggal_pinjam (tanggal_pinjam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: admin
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Data Awal: Admin
-- ============================================
-- Password: admin123 (hashed dengan bcrypt)
INSERT INTO admin (username, password, nama_lengkap) VALUES 
('admin', '$2b$10$YourHashedPasswordHere', 'Administrator TKJ')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- Data Awal: Barang (Sample Data)
-- ============================================
INSERT INTO barang (kode_barang, nama_barang, jumlah_stok, jumlah_dipinjam, notes) VALUES
('BRG-001', 'Tang Crimping RJ45', 10, 0, 'Untuk crimping kabel UTP'),
('BRG-002', 'Kabel Tester', 8, 0, 'Untuk testing koneksi kabel'),
('BRG-003', 'Obeng Set', 15, 0, 'Set obeng lengkap dengan berbagai ukuran'),
('BRG-004', 'LAN Tester', 6, 0, 'Untuk testing koneksi jaringan LAN'),
('BRG-005', 'Kabel UTP Cat6 (Roll)', 20, 0, 'Kabel UTP Category 6 per roll'),
('BRG-006', 'RJ45 Connector (Box)', 50, 0, 'Konektor RJ45 untuk kabel UTP'),
('BRG-007', 'Cable Stripper', 5, 0, 'Untuk mengupas kabel UTP'),
('BRG-008', 'Multimeter Digital', 4, 0, 'Untuk mengukur tegangan dan arus'),
('BRG-009', 'Switch 8 Port', 3, 0, 'Switch jaringan 8 port'),
('BRG-010', 'Toolkit Komputer', 12, 0, 'Set alat lengkap untuk maintenance PC')
ON DUPLICATE KEY UPDATE kode_barang=kode_barang;

-- ============================================
-- Views (Optional): Untuk reporting
-- ============================================

-- View: Barang dengan info ketersediaan
CREATE OR REPLACE VIEW v_barang_status AS
SELECT 
  b.id_barang,
  b.kode_barang,
  b.nama_barang,
  b.jumlah_stok,
  b.jumlah_dipinjam,
  (b.jumlah_stok - b.jumlah_dipinjam) AS jumlah_tersedia,
  CASE 
    WHEN (b.jumlah_stok - b.jumlah_dipinjam) > 0 THEN 'Tersedia'
    ELSE 'Habis'
  END AS status_ketersediaan,
  b.foto_barang,
  b.notes,
  b.created_at
FROM barang b;

-- View: Peminjaman dengan detail barang
CREATE OR REPLACE VIEW v_peminjaman_detail AS
SELECT 
  p.id_peminjaman,
  p.kode_peminjaman,
  p.nama_peminjam,
  p.kontak,
  p.keperluan,
  p.guru_pendamping,
  p.jumlah,
  p.foto_credential,
  p.tanggal_pinjam,
  p.tanggal_kembali,
  p.status,
  b.kode_barang,
  b.nama_barang,
  b.foto_barang,
  DATEDIFF(IFNULL(p.tanggal_kembali, NOW()), p.tanggal_pinjam) AS lama_pinjam_hari
FROM peminjaman p
JOIN barang b ON p.id_barang = b.id_barang;

-- ============================================
-- Triggers (Optional): Auto-update stok
-- ============================================

-- Trigger: Update stok saat peminjaman dibuat
DELIMITER //
CREATE TRIGGER after_peminjaman_insert
AFTER INSERT ON peminjaman
FOR EACH ROW
BEGIN
  IF NEW.status = 'Dipinjam' THEN
    UPDATE barang 
    SET jumlah_dipinjam = jumlah_dipinjam + NEW.jumlah
    WHERE id_barang = NEW.id_barang;
  END IF;
END//
DELIMITER ;

-- Trigger: Update stok saat status peminjaman berubah
DELIMITER //
CREATE TRIGGER after_peminjaman_update
AFTER UPDATE ON peminjaman
FOR EACH ROW
BEGIN
  -- Jika status berubah dari Dipinjam ke Dikembalikan
  IF OLD.status = 'Dipinjam' AND NEW.status = 'Dikembalikan' THEN
    UPDATE barang 
    SET jumlah_dipinjam = jumlah_dipinjam - NEW.jumlah
    WHERE id_barang = NEW.id_barang;
  END IF;
  
  -- Jika status berubah dari Dikembalikan ke Dipinjam (edge case)
  IF OLD.status = 'Dikembalikan' AND NEW.status = 'Dipinjam' THEN
    UPDATE barang 
    SET jumlah_dipinjam = jumlah_dipinjam + NEW.jumlah
    WHERE id_barang = NEW.id_barang;
  END IF;
END//
DELIMITER ;

-- ============================================
-- Indexes untuk Performance
-- ============================================
CREATE INDEX idx_peminjaman_tanggal ON peminjaman(tanggal_pinjam DESC);
CREATE INDEX idx_peminjaman_status_tanggal ON peminjaman(status, tanggal_pinjam DESC);

-- ============================================
-- Selesai!
-- ============================================
SELECT 'Database schema created successfully!' AS status;
SELECT 'Total Barang:', COUNT(*) FROM barang;
SELECT 'Total Admin:', COUNT(*) FROM admin;
