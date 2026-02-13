const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
// const { validateObjectId } = require('../middleware/validation'); // ← COMMENT OUT
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById); // ← REMOVE validateObjectId('id')

// Protected admin routes
router.post('/', protect, adminOnly, createService); // ← NO VALIDATION
router.put('/:id', protect, adminOnly, updateService); // ← REMOVE validateObjectId('id')
router.delete('/:id', protect, adminOnly, deleteService); // ← REMOVE validateObjectId('id')

module.exports = router;