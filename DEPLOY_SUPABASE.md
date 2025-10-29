# 🚀 Panduan Deploy ke Supabase (PostgreSQL) - FULL FREE

## 📋 Prerequisites

- Akun Supabase (gratis di supabase.com)
- Akun Render atau Railway (untuk backend)
- Akun Vercel (untuk frontend)
- Git dan GitHub

---

## 🔧 STEP 1: Setup Database Supabase

### 1.1 Buat Project Supabase
1. Daftar/login di **supabase.com**
2. Klik **"New Project"**
3. Isi detail:
   - **Name**: tkj-borrow
   - **Database Password**: Buat password kuat (SIMPAN!)
   - **Region**: Pilih yang dekat Indonesia (misal: Southeast Asia)
4. Klik **"Create new project"** (tunggu 2 menit)

### 1.2 Import Schema Database

1. Di Supabase, klik menu **"SQL Editor"** (kiri)
2. Klik **"New query"**
3. Copy semua isi file **`DATABASE_SCHEMA_POSTGRES.sql`**
4. Paste di SQL Editor
5. Klik **"Run"** atau tekan `Ctrl/Cmd + Enter`
6. Cek output: harus ada "Database schema created successfully!"

### 1.3 Dapatkan Connection String

1. Di Supabase, klik menu **"Project Settings"** (gear icon)
2. Scroll ke **"Database"**
3. Salin **"Connection String"** (format: `postgresql://...`)
4. **SIMPAN** untuk digunakan di backend

---

## 🔧 STEP 2: Update Backend Code

### 2.1 Install Package PostgreSQL

```bash
cd server
npm install pg
```

### 2.2 Update Environment Variables

Buat file `.env` di folder `server/`:

```env
# Database Supabase
DB_HOST=db.xxxxx.supabase.co
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_NAME=postgres
DB_PORT=5432

# Atau bisa pakai connection string langsung:
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# JWT Secret (ganti dengan string random)
JWT_SECRET=your-super-secret-random-string-min-32-chars

# CORS (akan diupdate setelah deploy frontend)
CORS_ORIGIN=https://tkj-borrow.vercel.app
```

### 2.3 Konversi File Controller

Kamu sudah punya file yang perlu dikonversi. Buka:

- `server/controllers/barangController.js`
- `server/controllers/peminjamanController.js`  
- `server/controllers/adminController.js`

**Perubahan manual yang perlu dilakukan:**

1. **Ganti sintaks query:**
   ```javascript
   // LAMA (MySQL):
   const [rows] = await db.query('SELECT * FROM barang WHERE id = ?', [id]);
   
   // BARU (PostgreSQL):
   const result = await db.query('SELECT * FROM barang WHERE id = $1', [id]);
   ```

2. **Ganti akses result:**
   ```javascript
   // LAMA:
   if (rows.length === 0) { ... }
   return rows[0];
   
   // BARU:
   if (result.rows.length === 0) { ... }
   return result.rows[0];
   ```

3. **Ganti insertId:**
   ```javascript
   // LAMA:
   const newId = result.insertId;
   
   // BARU:
   const newId = result.rows[0].id_barang;
   ```

4. **Ganti affectedRows:**
   ```javascript
   // LAMA:
   if (result.affectedRows === 0) { ... }
   
   // BARU:
   if (result.rowCount === 0) { ... }
   ```

### 2.4 Test Backend Lokal

```bash
cd server
npm start
```

Cek:
- ✅ Database connected successfully
- ✅ API bisa diakses di `http://localhost:3001/api/barang`

---

## 🔧 STEP 3: Deploy Backend ke Render

### 3.1 Setup Render

1. Login ke **render.com**
2. Klik **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Pilih folder `server/` sebagai **Root Directory**

### 3.2 Configure Build

**Environment:**
- **Build Command**: `npm install` (biarkan kosong juga bisa)
- **Start Command**: `node index.js`

### 3.3 Set Environment Variables

Di Render dashboard, tambahkan variabel:

```env
DB_HOST=db.xxxxx.supabase.co
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_NAME=postgres
DB_PORT=5432
JWT_SECRET=your-super-secret-random-string
CORS_ORIGIN=https://tkj-borrow.vercel.app
NODE_ENV=production
```

### 3.4 Deploy

1. Klik **"Create Web Service"**
2. Tunggu deploy selesai (3-5 menit)
3. Dapatkan URL: `https://tkj-borrow-api.onrender.com`

### 3.5 Test Backend

Buka browser: `https://tkj-borrow-api.onrender.com/api/barang`

Harus return JSON array (bisa kosong).

---

## 🔧 STEP 4: Deploy Frontend ke Vercel

### 4.1 Setup Vercel

1. Login ke **vercel.com**
2. Klik **"Add New Project"**
3. Connect GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.2 Set Environment Variables

Di Vercel dashboard, tambahkan:

```env
VITE_API_URL=https://tkj-borrow-api.onrender.com/api
```

### 4.3 Configure Routing (untuk SPA)

Di Vercel project settings:

1. Go to **"Settings"** → **"Rewrites"**
2. Add rewrite rule:
   - **Source**: `/(.*)`
   - **Destination**: `/index.html`

### 4.4 Deploy

1. Klik **"Deploy"**
2. Tunggu deploy selesai
3. Dapatkan URL: `https://tkj-borrow.vercel.app`

### 4.5 Test Frontend

Buka: `https://tkj-borrow.vercel.app`

Harus:
- ✅ Halaman beranda muncul
- ✅ Bisa klik "Pinjam Barang"
- ✅ QR Scanner muncul (perlu izin kamera)

---

## 🧪 STEP 5: Testing End-to-End

### 5.1 Test API Connection

1. Buka Network tab di browser (F12)
2. Buka halaman app
3. Cek request ke `/api/barang`
4. Harus return JSON (bisa kosong array)

### 5.2 Test Peminjaman

1. Scan atau input manual kode barang
2. Isi formulir peminjaman
3. Ambil foto
4. Submit
5. Harus muncul kode peminjaman

### 5.3 Verifikasi di Supabase

1. Buka Supabase dashboard
2. Go to **"Table Editor"**
3. Pilih tabel `peminjaman`
4. Harus ada data baru yang baru saja dibuat

---

## 🔒 STEP 6: Security & Final Touches

### 6.1 Generate Password Hash untuk Admin

```bash
cd server
node scripts/hashPassword.js admin123
```

Copy hash yang dihasilkan, update ke table admin di Supabase:

```sql
UPDATE admin SET password = 'hashed_password_here' WHERE username = 'admin';
```

### 6.2 Test Login Admin

1. Buka: `https://tkj-borrow.vercel.app/tkj-mgmt-2025/login`
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`

### 6.3 Enable SSL untuk Production

Render dan Vercel otomatis pakai HTTPS ✅

---

## 📊 Troubleshooting

### Backend Error: "Connection refused"

**Penyebab**: Environment variables belum diset di Render

**Solusi**: 
1. Buka Render dashboard
2. Go to Environment tab
3. Tambahkan semua variabel DB

---

### Database Error: "permission denied"

**Penyebab**: RLS (Row Level Security) enabled di Supabase

**Solusi**:
Jalankan di Supabase SQL Editor:

```sql
ALTER TABLE barang DISABLE ROW LEVEL SECURITY;
ALTER TABLE peminjaman DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;
```

---

### Frontend: "CORS error"

**Penyebab**: CORS origin belum diset

**Solusi**:
1. Update `CORS_ORIGIN` di Render
2. Restart service

---

### Camera tidak muncul

**Penyebab**: Browser tidak support atau insecure context

**Solusi**:
- ✅ Pastikan pakai HTTPS (Vercel otomatis)
- ✅ Izinkan permission di browser
- ✅ Pakai browser modern (Chrome, Firefox, Safari)

---

## ✅ Checklist Final

- [ ] Database Supabase berhasil dibuat
- [ ] Schema database berhasil di-import
- [ ] Backend code dikonversi ke PostgreSQL
- [ ] Backend berhasil deploy di Render
- [ ] Frontend berhasil deploy di Vercel
- [ ] API connection berfungsi
- [ ] Peminjaman berfungsi (scan QR, form, foto, submit)
- [ ] Login admin berfungsi
- [ ] Data masuk ke Supabase
- [ ] Kamera berfungsi di HTTPS

---

## 🎉 Selesai!

App kamu sekarang live di:
- **Frontend**: `https://tkj-borrow.vercel.app`
- **Backend**: `https://tkj-borrow-api.onrender.com`
- **Database**: Supabase (PostgreSQL)

**Semua 100% GRATIS!** 🚀

---

## 📝 Next Steps (Optional)

1. **Custom Domain**: Tambahkan domain sendiri di Vercel
2. **Backup Database**: Setup automatic backup di Supabase
3. **Monitoring**: Tambahkan error tracking (Sentry)
4. **Analytics**: Tambahkan Google Analytics

