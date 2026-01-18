const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateReferenceImages } = require('../validators/imageValidator'); // ← NEW
const {
  createQuotation,
  getMyQuotations,
  getQuotationById,
  getAllQuotations,
  updateQuotation,
  deleteQuotation,
  addImagesToQuotation,      // ← NEW
  removeImagesFromQuotation  // ← NEW
} = require('../controllers/quotationController');

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }
  
  next();
};

// Public/Guest routes
router.post('/', optionalAuth, validateReferenceImages, createQuotation); // ← UPDATED: Added validation

// Protected client routes
router.get('/my-quotations', protect, getMyQuotations);
router.get('/:id', protect, getQuotationById);

// ===== NEW: Image management routes =====
router.patch('/:id/images/add', protect, validateReferenceImages, addImagesToQuotation);
router.patch('/:id/images/remove', protect, removeImagesFromQuotation);

// Admin routes (but PUT allows clients for revisions)
router.get('/', protect, adminOnly, getAllQuotations);
router.put('/:id', protect, updateQuotation);
router.delete('/:id', protect, adminOnly, deleteQuotation);

module.exports = router;