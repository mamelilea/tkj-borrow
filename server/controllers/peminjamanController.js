const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate borrowing code
const generateBorrowingCode = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PMJ-${year}-${random}`;
};

// Get all peminjaman
exports.getAllPeminjaman = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT p.*, b.nama_barang, b.kode_barang, b.foto_barang
      FROM peminjaman p
      LEFT JOIN barang b ON p.id_barang = b.id_barang
    `;
    
    const params = [];
    
    if (status && status !== 'all') {
      query += ' WHERE p.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [rows] = await db.query(query, params);
    
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error getting peminjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching peminjaman',
      error: error.message,
    });
  }
};

// Get peminjaman by code
exports.getPeminjamanByCode = async (req, res) => {
  try {
    const { kode } = req.params;
    
    const [rows] = await db.query(
      `SELECT p.*, b.nama_barang, b.kode_barang, b.foto_barang
       FROM peminjaman p
       LEFT JOIN barang b ON p.id_barang = b.id_barang
       WHERE p.kode_peminjaman = ?`,
      [kode]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman not found',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error getting peminjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching peminjaman',
      error: error.message,
    });
  }
};

// Create new peminjaman
exports.createPeminjaman = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      id_barang,
      nama_peminjam,
      kontak,
      keperluan,
      guru_pendamping,
      jumlah,
      foto_credential,
    } = req.body;

    // Validate required fields
    if (!id_barang || !nama_peminjam || !keperluan || !guru_pendamping || !jumlah) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi',
      });
    }

    // Check barang availability
    const [barangRows] = await connection.query(
      'SELECT jumlah_stok, jumlah_dipinjam FROM barang WHERE id_barang = ?',
      [id_barang]
    );

    if (barangRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Barang tidak ditemukan',
      });
    }

    const barang = barangRows[0];
    const available = barang.jumlah_stok - barang.jumlah_dipinjam;

    if (available < jumlah) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Tersedia: ${available}`,
      });
    }

    // Generate unique borrowing code
    const kode_peminjaman = generateBorrowingCode();

    // Insert peminjaman
    const [result] = await connection.query(
      `INSERT INTO peminjaman 
       (kode_peminjaman, id_barang, nama_peminjam, kontak, keperluan, guru_pendamping, jumlah, foto_credential) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [kode_peminjaman, id_barang, nama_peminjam, kontak || null, keperluan, guru_pendamping, jumlah, foto_credential || null]
    );

    // Update barang jumlah_dipinjam
    await connection.query(
      'UPDATE barang SET jumlah_dipinjam = jumlah_dipinjam + ? WHERE id_barang = ?',
      [jumlah, id_barang]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Peminjaman berhasil dibuat',
      data: {
        id_peminjaman: result.insertId,
        kode_peminjaman,
        id_barang,
        nama_peminjam,
        jumlah,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating peminjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating peminjaman',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Return barang (update status to Dikembalikan)
exports.returnBarang = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { kode_peminjaman } = req.params;
    const { foto_verifikasi } = req.body;

    // Get peminjaman data
    const [peminjamanRows] = await connection.query(
      'SELECT * FROM peminjaman WHERE kode_peminjaman = ? AND status = "Dipinjam"',
      [kode_peminjaman]
    );

    if (peminjamanRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Peminjaman tidak ditemukan atau sudah dikembalikan',
      });
    }

    const peminjaman = peminjamanRows[0];

    // Update peminjaman status
    await connection.query(
      'UPDATE peminjaman SET status = "Dikembalikan", tanggal_kembali = NOW() WHERE kode_peminjaman = ?',
      [kode_peminjaman]
    );

    // Update barang jumlah_dipinjam
    await connection.query(
      'UPDATE barang SET jumlah_dipinjam = jumlah_dipinjam - ? WHERE id_barang = ?',
      [peminjaman.jumlah, peminjaman.id_barang]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Barang berhasil dikembalikan',
      data: {
        kode_peminjaman,
        tanggal_kembali: new Date(),
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error returning barang:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning barang',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Update peminjaman
exports.updatePeminjaman = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedUpdates = ['nama_peminjam', 'kontak', 'keperluan', 'guru_pendamping', 'status'];
    const updateFields = [];
    const updateValues = [];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    updateValues.push(id);

    const [result] = await db.query(
      `UPDATE peminjaman SET ${updateFields.join(', ')} WHERE id_peminjaman = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Peminjaman not found',
      });
    }

    res.json({
      success: true,
      message: 'Peminjaman updated successfully',
    });
  } catch (error) {
    console.error('Error updating peminjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating peminjaman',
      error: error.message,
    });
  }
};

// Delete peminjaman
exports.deletePeminjaman = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get peminjaman data
    const [peminjamanRows] = await connection.query(
      'SELECT * FROM peminjaman WHERE id_peminjaman = ?',
      [id]
    );

    if (peminjamanRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Peminjaman not found',
      });
    }

    const peminjaman = peminjamanRows[0];

    // If still borrowed, update barang count
    if (peminjaman.status === 'Dipinjam') {
      await connection.query(
        'UPDATE barang SET jumlah_dipinjam = jumlah_dipinjam - ? WHERE id_barang = ?',
        [peminjaman.jumlah, peminjaman.id_barang]
      );
    }

    // Delete peminjaman
    await connection.query(
      'DELETE FROM peminjaman WHERE id_peminjaman = ?',
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Peminjaman deleted successfully',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting peminjaman:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting peminjaman',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const [totalBarang] = await db.query('SELECT COUNT(*) as count FROM barang');
    const [totalPeminjaman] = await db.query('SELECT COUNT(*) as count FROM peminjaman');
    const [activePeminjaman] = await db.query('SELECT COUNT(*) as count FROM peminjaman WHERE status = "Dipinjam"');
    const [completedPeminjaman] = await db.query('SELECT COUNT(*) as count FROM peminjaman WHERE status = "Dikembalikan"');
    const [totalStok] = await db.query('SELECT SUM(jumlah_stok) as total, SUM(jumlah_dipinjam) as dipinjam FROM barang');

    res.json({
      success: true,
      data: {
        total_barang: totalBarang[0].count,
        total_peminjaman: totalPeminjaman[0].count,
        active_peminjaman: activePeminjaman[0].count,
        completed_peminjaman: completedPeminjaman[0].count,
        total_stok: totalStok[0].total || 0,
        total_dipinjam: totalStok[0].dipinjam || 0,
        total_tersedia: (totalStok[0].total || 0) - (totalStok[0].dipinjam || 0),
      },
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};
