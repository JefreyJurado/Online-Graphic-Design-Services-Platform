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

// Fallback only covers the current production deployment; every environment
// should really set FRONTEND_URL itself.
const DEFAULT_FRONTEND_URL = 'https://jefreyjurado.github.io/Online-Graphic-Design-Services-Platform';
// Strip any trailing slash so `${FRONTEND_URL}/page.html` never produces a
// double slash, regardless of whether the env var was set with one.
const FRONTEND_URL = (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, '');

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
    failureRedirect: `${FRONTEND_URL}/login.html`
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role, tokenVersion: req.user.tokenVersion },
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

      res.redirect(`${FRONTEND_URL}/google-auth-success.html?token=${token}&user=${userData}`);
    } catch (error) {
      console.error('❌ Google callback error:', error);
      res.redirect(`${FRONTEND_URL}/login.html?error=auth_failed`);
    }
  }
);

// Change Password Route - ADD VALIDATION
router.put('/change-password', protect, authLimiter, validateChangePassword, async (req, res) => {
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

    // Bumping tokenVersion invalidates every token issued before this
    // point (including a stolen one), not just the one making this request.
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      $inc: { tokenVersion: 1 }
    }, { new: true });

    // Issue a fresh token so the session that just changed the password
    // doesn't immediately get logged out by its own tokenVersion bump.
    const token = jwt.sign(
      { id: updatedUser._id, role: updatedUser.role, tokenVersion: updatedUser.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
      token
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