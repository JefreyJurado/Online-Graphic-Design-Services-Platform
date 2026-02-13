const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Service validation
const validateService = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Service name must be between 3 and 100 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Logo Design', 'Branding', 'Print Design', 'Digital Design', 'Packaging', 'Illustration', 'Other'])
    .withMessage('Invalid category'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('basePrice')
    .notEmpty().withMessage('Base price is required')
    .isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  
  body('deliveryTime')
    .optional()
    .isInt({ min: 1 }).withMessage('Delivery time must be at least 1 day'),
  
  handleValidationErrors
];

// Quotation validation
const validateQuotation = [
  body('service')
    .notEmpty().withMessage('Service is required')
    .isMongoId().withMessage('Invalid service ID'),
  
  body('projectName')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  
  body('budget')
    .trim()
    .notEmpty().withMessage('Budget is required')
    .isIn(['Under ₱5,000', '₱5,000 - ₱10,000', '₱10,000 - ₱20,000', 'Above ₱20,000'])
    .withMessage('Invalid budget range'),
  
  body('deadline')
    .notEmpty().withMessage('Deadline is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const deadline = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadline < today) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('contactPhone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

// Quotation status validation
const validateQuotationStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn([
      'pending', 
      'reviewing', 
      'quoted', 
      'accepted', 
      'in_progress', 
      'revision_requested',
      'completed', 
      'rejected'
    ])
    .withMessage('Invalid status value'),
  
  body('quotedPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Quoted price must be a positive number'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Admin notes must be less than 500 characters'),
  
  body('revisionRequest')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Revision request must be less than 1000 characters'),
  
  handleValidationErrors
];

// Unsplash search validation
const validateUnsplashSearch = [
  query('query')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 2, max: 100 }).withMessage('Query must be between 2 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Page must be between 1 and 100'),
  
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 30 }).withMessage('Per page must be between 1 and 30'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateService,
  validateQuotation,
  validateObjectId,
  validateQuotationStatus,
  validateUnsplashSearch,
  handleValidationErrors
};