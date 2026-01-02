const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { getValidationMiddleware } = require('../middleware/validation');
const { User, ServiceProvider } = require('../models/pg');
const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register endpoint
router.post('/register', getValidationMiddleware('register'), async (req, res) => {
  try {
    const { 
      email, password, firstName, lastName, userType, phone, googleId,
      serviceLocation, serviceCategories, locationData, companyName, businessType, description
    } = req.body;

    // Check if user already exists by email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please use a different email or try logging in.',
        field: 'email'
      });
    }

    // Check if Google ID already exists
    if (googleId) {
      const existingGoogleUser = await User.findByGoogleId(googleId);
      if (existingGoogleUser) {
        return res.status(400).json({
          success: false,
          message: 'This Google account is already registered'
        });
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      user_type: userType,
      google_id: googleId || null
    });

    // Create service provider profile if user is a service provider
    if (userType === 'service_provider') {
      const businessName = companyName || `${firstName} ${lastName}'s Business`;
      
      const providerLocationData = locationData || {};
      const serviceLocationString = serviceLocation || 
        `${providerLocationData.street || ''}, ${providerLocationData.ward || ''}, ${providerLocationData.district || ''}, ${providerLocationData.region || ''}, Tanzania`
        .replace(/^, |, , /g, ', ').replace(/^, /, '').trim();
      
      await ServiceProvider.create({
        user_id: newUser.id,
        business_name: businessName,
        business_type: businessType || 'General Services',
        location: serviceLocationString,
        service_location: serviceLocationString,
        description: description || `Professional ${businessType || 'service'} provider`,
        country: 'Tanzania',
        region: providerLocationData.region || '',
        district: providerLocationData.district || '',
        area: providerLocationData.area || '',
        ward: providerLocationData.ward || '',
        location_data: {
          region: providerLocationData.region || '',
          district: providerLocationData.district || '',
          ward: providerLocationData.ward || '',
          street: providerLocationData.street || ''
        },
        service_categories: serviceCategories ? (Array.isArray(serviceCategories) ? serviceCategories : [serviceCategories]) : [businessType || 'General'],
        is_verified: false
      });

      console.log('✅ Service Provider created:', {
        business_name: businessName,
        location: serviceLocationString
      });
    }

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        userType: newUser.user_type,
        isVerified: newUser.is_verified
      },
      token
    });
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    
    // Handle PostgreSQL unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
        field: 'email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint
router.post('/login', getValidationMiddleware('login'), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Please use Google login for this account'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isVerified: user.is_verified
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      const authToken = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email, 
          user_type: req.user.user_type 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${authToken}&user_type=${req.user.user_type}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
  }
);

// Logout endpoint
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        isVerified: user.is_verified,
        phone: user.phone,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Verify email endpoint (placeholder)
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email'
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

module.exports = router;