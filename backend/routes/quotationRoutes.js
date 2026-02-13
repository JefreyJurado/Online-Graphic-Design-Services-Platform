const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateReferenceImages } = require('../validators/imageValidator');
const { quotationLimiter } = require('../middleware/rateLimiter'); 
const { validateObjectId } = require('../middleware/validation');
const {
  createQuotation,
  getMyQuotations,
  getQuotationById,
  getAllQuotations,
  updateQuotation,
  deleteQuotation,
  addImagesToQuotation,
  removeImagesFromQuotation
} = require('../controllers/quotationController');

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

// Public/Guest routes - ADD RATE LIMITER
router.post('/', optionalAuth, quotationLimiter, validateReferenceImages, createQuotation); 

// Protected client routes - ADD VALIDATION
router.get('/my-quotations', protect, getMyQuotations);
router.get('/:id', protect, validateObjectId('id'), getQuotationById); 

// Image management routes - ADD VALIDATION
router.patch('/:id/images/add', protect, validateObjectId('id'), validateReferenceImages, addImagesToQuotation); 
router.patch('/:id/images/remove', protect, validateObjectId('id'), removeImagesFromQuotation); 

// Admin routes - ADD VALIDATION
router.get('/', protect, adminOnly, getAllQuotations);
router.put('/:id', protect, validateObjectId('id'), updateQuotation); 
router.delete('/:id', protect, adminOnly, validateObjectId('id'), deleteQuotation); 

module.exports = router;