const { query, validationResult } = require('express-validator');

const validateSearchQuery = [
  // Validate search query
  query('query')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Search query must be between 3 and 100 characters')
    .escape(), // Prevents XSS attacks
  
  // Validate page parameter (optional)
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  // Validate per_page parameter (optional)
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Per page must be between 1 and 30'),
  
  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid search parameters',
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = { validateSearchQuery };