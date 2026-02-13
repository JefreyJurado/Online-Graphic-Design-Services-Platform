const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Google OAuth Routes - ADD THE FIRST ROUTE HERE!
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login.html'
  }),
  (req, res) => {
    try {
      console.log('🎯 Google callback hit!');
      console.log('👤 User from Google:', req.user);
      
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('🔑 Token generated:', token);

      // Redirect to frontend with token and user data
      const userData = encodeURIComponent(JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        profilePicture: req.user.profilePicture,
        dateRegistered: req.user.dateRegistered
      }));

      console.log('📦 User data prepared');
      console.log('🔀 Redirecting to:', `http://127.0.0.1:5500/google-auth-success.html?token=${token.substring(0, 20)}...`);

      res.redirect(`http://127.0.0.1:5500/google-auth-success.html?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('❌ Google callback error:', error);
      console.error('Error stack:', error.stack);
      res.redirect('http://127.0.0.1:5500/login.html?error=auth_failed');
    }
  }
);

// Change Password Route
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide current and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userWithPassword = await User.findById(req.user.id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user.id, { 
      password: hashedPassword 
    });

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

module.exports = router;