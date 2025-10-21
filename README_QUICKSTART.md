# Quick Start Guide - TKJ Peminjaman Barang

Panduan cepat untuk menjalankan aplikasi di komputer lokal.

## 🚀 Setup Cepat (5 Menit)

### 1️⃣ Persiapan
```bash
# Clone dari GitHub
git clone <YOUR_REPO_URL>
cd <PROJECT_NAME>
```

### 2️⃣ Setup Database MySQL
```bash
# Login ke MySQL
mysql -u root -p

# Jalankan SQL ini:
# (Copy dari SETUP_LOCAL.md bagian "Setup Database MySQL")
```

### 3️⃣ Setup Backend
```bash
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Copy dan edit file .env
cp .env.example .env
# Edit .env, sesuaikan DB_PASSWORD dengan password MySQL Anda

# Jalankan server
npm run dev
```

✅ Backend running di `http://localhost:3001`

### 4️⃣ Setup Frontend
```bash
# Buka terminal baru, kembali ke root project
cd ..

# Install dependencies (jika belum)
npm install

# Copy .env (optional, untuk custom API URL)
cp .env.example .env

# Jalankan frontend
npm run dev
```

✅ Frontend running di `http://localhost:8080`

## 🎯 Testing

1. **Buka browser:** `http://localhost:8080`
2. **Test user flow:**
   - Klik "Pinjam Barang"
   - Pilih "Input Manual" (kamera mungkin perlu permission)
   - Masukkan kode: `BRG-001`
   - Isi form dan lanjutkan

3. **Test admin dashboard:**
   - Buka: `http://localhost:8080/tkj-mgmt-2025/dashboard`
   - Explore menu Barang & Peminjaman

## 🌐 Akses dari LAN (Komputer Lain)

1. **Cari IP komputer server:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```
   Contoh IP: `192.168.1.100`

2. **Update API URL di frontend:**
   Edit file `.env` di root project:
   ```
   VITE_API_URL=http://192.168.1.100:3001/api
   ```

3. **Rebuild frontend:**
   ```bash
   npm run dev
   ```

4. **Akses dari komputer lain:**
   - Frontend: `http://192.168.1.100:8080`
   - Backend API: `http://192.168.1.100:3001`

## ❓ Troubleshooting Cepat

**Backend tidak jalan:**
- Cek MySQL sudah running: `sudo systemctl status mysql`
- Cek password di `.env` sudah benar
- Cek port 3001 tidak dipakai: `netstat -an | grep 3001`

**Frontend tidak connect ke backend:**
- Buka browser DevTools → Console → cek error
- Pastikan backend running
- Cek CORS di `server/index.js` sudah enable

**QR Scanner tidak jalan:**
- Browser perlu HTTPS atau localhost
- Klik tombol "Input Manual" sebagai fallback
- Check browser permission untuk camera

## 📚 Dokumentasi Lengkap

Lihat **SETUP_LOCAL.md** untuk panduan detail lengkap.

## 🆘 Butuh Bantuan?

1. Cek console error di browser (F12)
2. Cek terminal backend untuk error log
3. Baca troubleshooting di SETUP_LOCAL.md
4. Tanya di chat! 💬
