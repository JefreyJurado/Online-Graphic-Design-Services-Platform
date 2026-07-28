const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateObjectId, validateService, validateServiceUpdate } = require('../middleware/validation');

const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// Public routes
router.get('/', getAllServices);
router.get('/:id', validateObjectId('id'), getServiceById);

// Protected admin routes
router.post('/', protect, adminOnly, validateService, createService);
router.put('/:id', protect, adminOnly, validateObjectId('id'), validateServiceUpdate, updateService);
router.delete('/:id', protect, adminOnly, validateObjectId('id'), deleteService);

module.exports = router;