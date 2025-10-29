const db = require('../config/database');

// Get all barang
exports.getAllBarang = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id_barang as id, kode_barang, nama_barang, jumlah_stok, jumlah_dipinjam, foto_barang, notes, created_at FROM barang ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting barang:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching barang',
      error: error.message,
    });
  }
};

// Get barang by ID
exports.getBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id_barang as id, kode_barang, nama_barang, jumlah_stok, jumlah_dipinjam, foto_barang, notes, created_at FROM barang WHERE id_barang = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error getting barang:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching barang',
      error: error.message,
    });
  }
};

// Get barang by kode
exports.getBarangByKode = async (req, res) => {
  try {
    const { kode } = req.params;
    const result = await db.query(
      'SELECT id_barang as id, kode_barang, nama_barang, jumlah_stok, jumlah_dipinjam, foto_barang, notes, created_at FROM barang WHERE kode_barang = $1',
      [kode]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error getting barang:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching barang',
      error: error.message,
    });
  }
};

// Create new barang
exports.createBarang = async (req, res) => {
  try {
    const { kode_barang, nama_barang, jumlah_stok, foto_barang, notes } = req.body;

    if (!kode_barang || !nama_barang || !jumlah_stok) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang, nama, dan jumlah stok harus diisi',
      });
    }

    const result = await db.query(
      'INSERT INTO barang (kode_barang, nama_barang, jumlah_stok, foto_barang, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id_barang',
      [kode_barang, nama_barang, jumlah_stok, foto_barang || null, notes || null]
    );

    const newId = result.rows[0].id_barang;

    // Get the created item with id alias
    const newItemResult = await db.query(
      'SELECT id_barang as id, kode_barang, nama_barang, jumlah_stok, jumlah_dipinjam, foto_barang, notes, created_at FROM barang WHERE id_barang = $1',
      [newId]
    );

    res.status(201).json({
      success: true,
      message: 'Barang created successfully',
      data: newItemResult.rows[0],
    });
  } catch (error) {
    console.error('Error creating barang:', error);
    if (error.code === '23505') { // PostgreSQL duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah digunakan',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating barang',
      error: error.message,
    });
  }
};

// Update barang
exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, jumlah_stok, foto_barang, notes } = req.body;

    const result = await db.query(
      'UPDATE barang SET nama_barang = $1, jumlah_stok = $2, foto_barang = $3, notes = $4 WHERE id_barang = $5',
      [nama_barang, jumlah_stok, foto_barang || null, notes || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang not found',
      });
    }

    res.json({
      success: true,
      message: 'Barang updated successfully',
    });
  } catch (error) {
    console.error('Error updating barang:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating barang',
      error: error.message,
    });
  }
};

// Delete barang
exports.deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if barang has active peminjaman
    const borrowResult = await db.query(
      'SELECT * FROM peminjaman WHERE id_barang = $1 AND status = $2',
      [id, 'Dipinjam']
    );

    if (borrowResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus barang yang sedang dipinjam',
      });
    }

    const result = await db.query(
      'DELETE FROM barang WHERE id_barang = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang not found',
      });
    }

    res.json({
      success: true,
      message: 'Barang deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting barang:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting barang',
      error: error.message,
    });
  }
};
