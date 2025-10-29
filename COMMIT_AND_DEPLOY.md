# 🚀 Deploy PostgreSQL ke Railway

## ⚠️ MASALAH:
Railway masih pakai MySQL karena code yang baru belum di-push ke repo.

## ✅ SOLUSI: Push ke GitHub

### 1. Commit semua perubahan
```bash
git add .
git commit -m "Convert MySQL to PostgreSQL"
git push
```

### 2. Railway akan otomatis redeploy
- Tunggu 2-3 menit
- Cek logs: harus muncul "PostgreSQL database connected successfully"

### 3. Test API lagi
```
https://tkj-peminjaman-server-production.up.railway.app/api/barang
```

---

## 🔍 Jika Masih Error Setelah Redeploy:

### Cek Database Connection:
Logs harusnya muncul:
```
✅ PostgreSQL database connected successfully
```

Kalau masih muncul:
```
❌ Database connection failed
```

Maka masalahnya di **Supabase connection string**.

### Fix:
1. Buka Supabase dashboard
2. Copy **Connection string** yang benar
3. Paste di Railway → Variables → `DATABASE_URL`
4. Redeploy lagi

---

## 📦 Dependencies yang Sudah Diganti:

✅ `mysql2` → dihapus dari `package.json`  
✅ `pg` → sudah ada di dependencies  
✅ Code controllers → sudah dikonversi ke PostgreSQL  
✅ `server/config/database.js` → sudah pakai PostgreSQL  

---

## 🔑 Railway Variables yang Perlu:

```env
DATABASE_URL=postgresql://postgres.a2b79eade287109cb2fe5e6de559805e@db.rqkdwfpjodzmkxxtkcji.supabase.co:5432/postgres

JWT_SECRET=super_secret_jwt_key_change_this_in_production
```

---

## ✅ Checklist:

- [ ] Code dikonversi ke PostgreSQL ✅
- [ ] mysql2 dihapus dari package.json ✅
- [ ] Push ke GitHub
- [ ] Railway redeploy otomatis
- [ ] DATABASE_URL set di Railway
- [ ] Test API endpoint

