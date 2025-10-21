const db = require('../config/database');

// Get all barang
exports.getAllBarang = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM barang ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: rows,
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
    const [rows] = await db.query(
      'SELECT * FROM barang WHERE id_barang = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang not found',
      });
    }

    res.json({
      success: true,
      data: rows[0],
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
    const [rows] = await db.query(
      'SELECT * FROM barang WHERE kode_barang = ?',
      [kode]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Barang not found',
      });
    }

    res.json({
      success: true,
      data: rows[0],
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

    const [result] = await db.query(
      'INSERT INTO barang (kode_barang, nama_barang, jumlah_stok, foto_barang, notes) VALUES (?, ?, ?, ?, ?)',
      [kode_barang, nama_barang, jumlah_stok, foto_barang || null, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Barang created successfully',
      data: {
        id_barang: result.insertId,
        kode_barang,
        nama_barang,
        jumlah_stok,
        foto_barang,
        notes,
      },
    });
  } catch (error) {
    console.error('Error creating barang:', error);
    if (error.code === 'ER_DUP_ENTRY') {
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

    const [result] = await db.query(
      'UPDATE barang SET nama_barang = ?, jumlah_stok = ?, foto_barang = ?, notes = ? WHERE id_barang = ?',
      [nama_barang, jumlah_stok, foto_barang || null, notes || null, id]
    );

    if (result.affectedRows === 0) {
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
    const [borrowings] = await db.query(
      'SELECT * FROM peminjaman WHERE id_barang = ? AND status = "Dipinjam"',
      [id]
    );

    if (borrowings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus barang yang sedang dipinjam',
      });
    }

    const [result] = await db.query(
      'DELETE FROM barang WHERE id_barang = ?',
      [id]
    );

    if (result.affectedRows === 0) {
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
