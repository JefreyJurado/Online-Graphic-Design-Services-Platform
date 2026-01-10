const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createQuotation,
  getMyQuotations,
  getQuotationById,
  getAllQuotations,
  updateQuotation,
  deleteQuotation
} = require('../controllers/quotationController');

// Client routes (protected)
router.post('/', protect, createQuotation);
router.get('/my-quotations', protect, getMyQuotations);
router.get('/:id', protect, getQuotationById);

// Admin routes
router.get('/', protect, adminOnly, getAllQuotations);
router.put('/:id', protect, adminOnly, updateQuotation);
router.delete('/:id', protect, adminOnly, deleteQuotation);

module.exports = router;