const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3Config');
const path = require('path');

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG and GIF are allowed.'), false);
  }
};

// Profile picture upload configuration
const uploadProfilePicture = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // ← ADD THIS LINE
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const userId = req.user ? req.user._id : 'guest';
      const fileName = `users/${userId}/profile/${Date.now()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for profile pictures
  },
  fileFilter: fileFilter
});

// Service image upload configuration
const uploadServiceImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // ← ADD THIS LINE
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const serviceId = req.params.serviceId || 'new-service';
      const fileName = `services/${serviceId}/${Date.now()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for service images
  },
  fileFilter: fileFilter
});

module.exports = {
  uploadProfilePicture,
  uploadServiceImage
};