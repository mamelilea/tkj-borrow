const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');

// GET all peminjaman
router.get('/', peminjamanController.getAllPeminjaman);

// GET statistics
router.get('/statistics', peminjamanController.getStatistics);

// GET peminjaman by code
router.get('/kode/:kode', peminjamanController.getPeminjamanByCode);

// POST create new peminjaman
router.post('/', peminjamanController.createPeminjaman);

// PUT return barang
router.put('/return/:kode_peminjaman', peminjamanController.returnBarang);

// PUT update peminjaman
router.put('/:id', peminjamanController.updatePeminjaman);

// DELETE peminjaman
router.delete('/:id', peminjamanController.deletePeminjaman);

module.exports = router;
