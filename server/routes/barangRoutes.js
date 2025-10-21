const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');

// GET all barang
router.get('/', barangController.getAllBarang);

// GET barang by ID
router.get('/:id', barangController.getBarangById);

// GET barang by kode
router.get('/kode/:kode', barangController.getBarangByKode);

// POST create new barang
router.post('/', barangController.createBarang);

// PUT update barang
router.put('/:id', barangController.updateBarang);

// DELETE barang
router.delete('/:id', barangController.deleteBarang);

module.exports = router;
