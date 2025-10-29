# Panduan Konversi MySQL → PostgreSQL untuk Supabase

## File yang Sudah Diganti

✅ **server/config/database.js** - Sudah diubah ke PostgreSQL

## File yang Perlu Dikonversi

### 1. server/controllers/barangController.js

**Perubahan yang perlu dilakukan:**
- Ganti `const [rows] = await db.query(...)` menjadi `const result = await db.query(...)`
- Ganti `rows` menjadi `result.rows`
- Ganti semua `?` menjadi `$1, $2, $3...`
- Ganti `result.insertId` menjadi `result.rows[0].id_barang`
- Ganti `result.affectedRows` menjadi `result.rowCount`

### 2. server/controllers/peminjamanController.js

**Perubahan sama seperti barangController.js**

### 3. server/controllers/adminController.js

**Perubahan sama seperti barangController.js**

## Perubahan Dasar

### Sintaks Query

**MySQL (Lama):**
```javascript
const [rows] = await db.query('SELECT * FROM barang WHERE id = ?', [id]);
if (rows.length === 0) { ... }
return rows[0];
```

**PostgreSQL (Baru):**
```javascript
const result = await db.query('SELECT * FROM barang WHERE id = $1', [id]);
if (result.rows.length === 0) { ... }
return result.rows[0];
```

### Insert & Get ID

**MySQL:**
```javascript
const [result] = await db.query('INSERT INTO ...');
const newId = result.insertId;
```

**PostgreSQL:**
```javascript
const result = await db.query('INSERT INTO ... RETURNING id_barang');
const newId = result.rows[0].id_barang;
```

### Update/Delete

**MySQL:**
```javascript
if (result.affectedRows === 0) { ... }
```

**PostgreSQL:**
```javascript
if (result.rowCount === 0) { ... }
```

## Package Dependencies

Tambahkan `pg` ke server:
```bash
cd server
npm install pg
```

## Environment Variables

Di Supabase, ambil connection string:
- Project Settings → Database → Connection string
- Format: `postgresql://user:password@host:port/database`

Di Render/Railway, tambahkan:
```
DB_HOST=your-supabase-host
DB_USER=your-supabase-user
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
DB_PORT=5432
```

atau bisa pakai:

```
DATABASE_URL=postgresql://user:pass@host:5432/postgres
```

## Deployment Steps

1. Install dependencies: `npm install pg`
2. Push code ke GitHub
3. Deploy ke Render/Railway
4. Set environment variables
5. Test API endpoint
6. Deploy frontend ke Vercel

## Testing

Setelah konversi, test:
1. Cek connection ke Supabase
2. Test CRUD untuk Barang
3. Test CRUD untuk Peminjaman
4. Test Login Admin

