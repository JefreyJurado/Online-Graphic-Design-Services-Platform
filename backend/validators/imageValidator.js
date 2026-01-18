const { body, validationResult } = require('express-validator');

const validateReferenceImages = [
  // Check if referenceImages is an array (if provided)
  body('referenceImages')
    .optional()
    .isArray()
    .withMessage('Reference images must be an array'),
  
  // Check maximum 5 images
  body('referenceImages')
    .optional()
    .custom((images) => {
      if (images && images.length > 5) {
        throw new Error('Maximum 5 reference images allowed per quotation');
      }
      return true;
    }),
  
  // Validate unsplashId for each image
  body('referenceImages.*.unsplashId')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Unsplash ID is required for each image')
    .isString()
    .withMessage('Unsplash ID must be a string'),
  
  // Validate url (must be from Unsplash CDN)
  body('referenceImages.*.url')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Image URL is required')
    .matches(/^https:\/\/images\.unsplash\.com\//)
    .withMessage('Image URL must be from Unsplash CDN (https://images.unsplash.com/)'),
  
  // Validate thumbUrl (must be from Unsplash CDN)
  body('referenceImages.*.thumbUrl')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Thumbnail URL is required')
    .matches(/^https:\/\/images\.unsplash\.com\//)
    .withMessage('Thumbnail URL must be from Unsplash CDN'),
  
  // Validate photographer.name (required for legal attribution)
  body('referenceImages.*.photographer.name')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Photographer name is required for legal attribution')
    .isLength({ min: 2, max: 100 })
    .withMessage('Photographer name must be between 2 and 100 characters'),
  
  // Validate photographer.username
  body('referenceImages.*.photographer.username')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Photographer username is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Photographer username must be between 2 and 50 characters'),
  
  // Validate photographer.profileLink
  body('referenceImages.*.photographer.profileLink')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Photographer profile link is required')
    .matches(/^https:\/\/unsplash\.com\/@/)
    .withMessage('Photographer profile link must be a valid Unsplash profile URL'),
  
  // Validate photoLink
  body('referenceImages.*.photoLink')
    .if(body('referenceImages').exists())
    .notEmpty()
    .withMessage('Photo link is required')
    .matches(/^https:\/\/unsplash\.com\/photos\//)
    .withMessage('Photo link must be a valid Unsplash photo URL'),
  
  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = { validateReferenceImages };