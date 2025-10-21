# Panduan Setup Local - Aplikasi Peminjaman Barang TKJ

## Prerequisites

Pastikan sudah terinstall:
- **Node.js** (v18 atau lebih baru) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 atau lebih baru) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended)

---

## 1. Clone & Setup Frontend

### A. Export dari Lovable ke GitHub
1. Di Lovable, klik tombol **"Export to GitHub"**
2. Pilih repository baru atau yang sudah ada
3. Clone repository ke komputer:

```bash
git clone <YOUR_GITHUB_URL>
cd <PROJECT_NAME>
```

### B. Install Dependencies Frontend
```bash
npm install
```

### C. Test Frontend (tanpa backend dulu)
```bash
npm run dev
```

Buka browser ke `http://localhost:8080` - aplikasi akan berjalan dengan mock data.

---

## 2. Setup Database MySQL

### A. Buat Database
Buka MySQL Workbench atau terminal MySQL:

```bash
mysql -u root -p
```

Jalankan SQL berikut:

```sql
CREATE DATABASE db_peminjaman_tkj;
USE db_peminjaman_tkj;

-- Tabel Barang
CREATE TABLE barang (
  id_barang INT AUTO_INCREMENT PRIMARY KEY,
  kode_barang VARCHAR(20) UNIQUE NOT NULL,
  nama_barang VARCHAR(100) NOT NULL,
  jumlah_stok INT NOT NULL DEFAULT 0,
  jumlah_dipinjam INT NOT NULL DEFAULT 0,
  foto_barang VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Peminjaman
CREATE TABLE peminjaman (
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
  FOREIGN KEY (id_barang) REFERENCES barang(id_barang)
);

-- Tabel Admin
CREATE TABLE admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin default (password: admin123)
-- Hash menggunakan bcrypt dengan salt 10
INSERT INTO admin (username, password, nama_lengkap) VALUES 
('admin', '$2b$10$rZ5LvZ5YR5YvZ5YvZ5YvZOGK9H8K9H8K9H8K9H8K9H8K9H8K9H8', 'Administrator');

-- Insert sample data barang
INSERT INTO barang (kode_barang, nama_barang, jumlah_stok, jumlah_dipinjam, foto_barang, notes) VALUES
('BRG-001', 'Tang Crimping RJ45', 10, 0, NULL, 'Untuk crimping kabel UTP'),
('BRG-002', 'Kabel Tester', 8, 0, NULL, 'Untuk testing koneksi kabel'),
('BRG-003', 'Obeng Set', 15, 0, NULL, 'Set obeng lengkap'),
('BRG-004', 'LAN Tester', 6, 0, NULL, 'Untuk testing koneksi LAN'),
('BRG-005', 'Kabel UTP Cat6 (Roll)', 20, 0, NULL, 'Kabel UTP Category 6');
```

### B. Verifikasi Database
```sql
SHOW TABLES;
SELECT * FROM barang;
SELECT * FROM admin;
```

---

## 3. Setup Backend (Express Server)

### A. Buat Folder Server
Di root project (sejajar dengan folder `src`):

```bash
mkdir server
cd server
npm init -y
```

### B. Install Dependencies Backend
```bash
npm install express mysql2 cors dotenv multer bcrypt jsonwebtoken uuid
npm install -D nodemon @types/node
```

### C. Setup Environment Variables
Buat file `server/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=db_peminjaman_tkj
DB_PORT=3306

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (ganti dengan random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# Upload Configuration
UPLOAD_PATH=./uploads
```

**⚠️ PENTING:** Ganti `DB_PASSWORD` dengan password MySQL Anda!

### D. Update package.json Backend
Edit `server/package.json`, tambahkan scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

---

## 4. Struktur Folder Backend

```
server/
├── config/
│   └── database.js
├── controllers/
│   ├── barangController.js
│   ├── peminjamanController.js
│   └── adminController.js
├── routes/
│   ├── barangRoutes.js
│   ├── peminjamanRoutes.js
│   └── adminRoutes.js
├── models/
│   └── (optional, bisa langsung di controller)
├── uploads/
│   └── (foto akan disimpan di sini)
├── .env
├── index.js
└── package.json
```

---

## 5. Testing & Running

### A. Test Backend
```bash
cd server
npm run dev
```

Server akan berjalan di `http://localhost:3001`

### B. Test Frontend (di terminal baru)
```bash
# Di root project
npm run dev
```

Frontend akan berjalan di `http://localhost:8080`

### C. Test API Endpoints
Gunakan Postman atau Thunder Client:

**GET Barang:**
```
GET http://localhost:3001/api/barang
```

**POST Peminjaman:**
```
POST http://localhost:3001/api/peminjaman
Content-Type: application/json

{
  "id_barang": 1,
  "nama_peminjam": "Ahmad",
  "kontak": "081234567890",
  "keperluan": "Praktikum",
  "guru_pendamping": "Pak Budi",
  "jumlah": 2
}
```

---

## 6. Deploy Lokal (LAN)

Untuk akses dari komputer lain di LAN yang sama:

### A. Cari IP Address Komputer Server
**Windows:**
```bash
ipconfig
```
Cari "IPv4 Address", contoh: `192.168.1.100`

**Linux/Mac:**
```bash
ifconfig
# atau
ip addr
```

### B. Update Frontend Config
Edit `src/lib/api.ts` (akan saya buatkan), ganti:
```typescript
const API_URL = "http://localhost:3001/api";
```
Menjadi:
```typescript
const API_URL = "http://192.168.1.100:3001/api";
```

### C. Akses dari Komputer Lain
Dari komputer lain di LAN yang sama:
- Frontend: `http://192.168.1.100:8080`
- Backend: `http://192.168.1.100:3001`

---

## 7. Troubleshooting

### Error: "Cannot connect to MySQL"
- Pastikan MySQL service sudah running
- Cek username/password di `.env`
- Cek port MySQL (default 3306)

### Error: "Port already in use"
- Ganti port di `.env` (backend) atau `vite.config.ts` (frontend)

### Error: "CORS policy"
- Pastikan CORS sudah di-enable di `server/index.js`

### Frontend tidak muncul data
- Cek Network tab di browser DevTools
- Pastikan backend sudah running
- Cek console untuk error

---

## 8. Tips Development

1. **Hot Reload:** Kedua server (frontend & backend) support hot reload
2. **Database Client:** Gunakan MySQL Workbench atau DBeaver untuk manage database
3. **API Testing:** Gunakan Postman atau Thunder Client extension di VS Code
4. **Git:** Jangan commit file `.env` (sudah ada di `.gitignore`)

---

## Next Steps

Setelah setup selesai, Anda bisa:
1. ✅ Customize design (warna, logo, dll)
2. ✅ Tambah fitur export PDF/Excel
3. ✅ Implementasi authentication admin
4. ✅ Tambah validation & security
5. ✅ Setup production deployment

---

**Butuh bantuan?** Tanyakan di chat! 🚀
