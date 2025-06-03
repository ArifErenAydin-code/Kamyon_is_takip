const express = require('express');
const router = express.Router();
const Operation = require('../models/operation');

// Tüm işlemleri listele
router.get('/', async (req, res) => {
  try {
    const operations = await Operation.find({ isActive: true })
      .populate('dukkan_id');
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni işlem ekle
router.post('/', async (req, res) => {
  try {
    const operation = new Operation({
      kamyon_plaka: req.body.kamyon_plaka,
      dukkan_id: req.body.dukkan_id,
      tarih: req.body.tarih,
      maliyet: req.body.maliyet,
      yapilan_is: req.body.yapilan_is,
      isActive: true
    });
    const newOperation = await operation.save();
    const populatedOperation = await Operation.findById(newOperation._id).populate('dukkan_id');
    res.status(201).json(populatedOperation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Belirli bir kamyonun işlemlerini getir
router.get('/truck/:plaka', async (req, res) => {
  try {
    const operations = await Operation.find({ 
      kamyon_plaka: req.params.plaka,
      isActive: true 
    }).populate('dukkan_id');
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// İşlemi güncelle
router.put('/:id', async (req, res) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!operation) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json(operation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// İşlemi soft delete
router.delete('/:id', async (req, res) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!operation) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json({ message: 'İşlem silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Belirli bir kamyonun işlemlerini soft delete
router.delete('/by-truck/:plaka', async (req, res) => {
  try {
    const result = await Operation.updateMany(
      { kamyon_plaka: req.params.plaka },
      { isActive: false }
    );
    res.json({ message: `${result.modifiedCount} işlem silindi` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// İşlemi geri yükle
router.put('/:id/restore', async (req, res) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!operation) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json(operation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Belirli bir kamyonun işlemlerini geri yükle
router.put('/by-truck/:plaka/restore', async (req, res) => {
  try {
    const result = await Operation.updateMany(
      { kamyon_plaka: req.params.plaka },
      { isActive: true }
    );
    res.json({ message: `${result.modifiedCount} işlem geri yüklendi` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// İşlemi kalıcı olarak sil
router.delete('/:id/permanent', async (req, res) => {
  try {
    const operation = await Operation.findByIdAndDelete(req.params.id);
    if (!operation) {
      return res.status(404).json({ message: 'İşlem bulunamadı' });
    }
    res.json({ message: 'İşlem kalıcı olarak silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Belirli bir kamyonun işlemlerini kalıcı olarak sil
router.delete('/by-truck/:plaka/permanent', async (req, res) => {
  try {
    const result = await Operation.deleteMany({ kamyon_plaka: req.params.plaka });
    res.json({ message: `${result.deletedCount} işlem kalıcı olarak silindi` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 