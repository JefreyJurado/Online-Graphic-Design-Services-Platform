const express = require('express');
const router = express.Router();
const { uploadProfilePicture, uploadServiceImage } = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const Service = require('../models/Service');

// @route   POST /api/upload/profile
// @desc    Upload profile picture
// @access  Private
router.post('/profile', protect, uploadLimiter, uploadProfilePicture.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Update user's profile picture in database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: req.file.location },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: req.file.location,
        user: user
      }
    });
  } catch (error) {
    console.error('❌ Profile upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @route   POST /api/upload/service/:serviceId
// @desc    Upload service image
// @access  Private (Admin only)
router.post('/service/:serviceId', protect, uploadLimiter, uploadServiceImage.single('serviceImage'), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can upload service images'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const serviceId = req.params.serviceId;

    // Add image URL to service's images array
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $push: { images: req.file.location } },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service image uploaded successfully',
      data: {
        imageUrl: req.file.location,
        service: service
      }
    });
  } catch (error) {
    console.error('Service image upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error uploading service image',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// @route   DELETE /api/upload/service/:serviceId/image
// @desc    Delete service image
// @access  Private (Admin only)
router.delete('/service/:serviceId/image', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete service images'
      });
    }

    const { serviceId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide image URL to delete'
      });
    }

    // Remove image URL from service's images array
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $pull: { images: imageUrl } },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service image deleted successfully',
      data: service
    });
  } catch (error) {
    console.error('Delete service image error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting service image',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;