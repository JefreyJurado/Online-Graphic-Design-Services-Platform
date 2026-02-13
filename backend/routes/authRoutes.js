const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/rateLimiter');
const { 
  validateRegister, 
  validateLogin, 
  validateChangePassword 
} = require('../middleware/validation');

// Apply rate limiter and validation to auth routes
router.post('/register', authLimiter, validateRegister, authController.register); 
router.post('/login', authLimiter, validateLogin, authController.login);

// Google OAuth Routes
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
    failureRedirect: 'https://jefrey-design.vercel.app/login.html'
  }),
  (req, res) => {
    try {
      console.log('🎯 Google callback hit!');
      console.log('📍 Request host:', req.get('host'));
      console.log('📍 Request protocol:', req.protocol);
      console.log('📍 Referer:', req.get('referer'));
      
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

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

      // Detect frontend URL from request
      let frontendURL;
      const host = req.get('host');
      
      if (host && host.includes('vercel.app')) {
        // Production - use production frontend
        frontendURL = 'https://jefrey-design.vercel.app';
      } else if (host && host.includes('localhost')) {
        // Local development
        frontendURL = 'http://127.0.0.1:5500';
      } else {
        // Fallback to production
        frontendURL = 'https://jefrey-design.vercel.app';
      }

      console.log('🔀 Detected frontendURL:', frontendURL);
      console.log('🔀 Full redirect URL:', `${frontendURL}/google-auth-success.html`);

      res.redirect(`${frontendURL}/google-auth-success.html?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('❌ Google callback error:', error);
      console.error('❌ Stack:', error.stack);
      res.redirect('https://jefrey-design.vercel.app/login.html?error=auth_failed');
    }
  }
);

// Change Password Route - ADD VALIDATION
router.put('/change-password', protect, validateChangePassword, async (req, res) => { 
  try {
    const { currentPassword, newPassword } = req.body;

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