const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { getValidationMiddleware } = require('../middleware/validation');
const { handleDuplicateKeyError } = require('../middleware/duplicateHandler');
const { User, ServiceProvider } = require('../models');
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

// Register endpoint - PostgreSQL version
router.post('/register', getValidationMiddleware('register'), async (req, res) => {
  try {
    const { 
      email, password, firstName, lastName, userType, phone, googleId,
      serviceLocation, serviceCategories, locationData, companyName, businessType, description
    } = req.body;

    // Check if user already exists by email (PostgreSQL)
    const existingUser = await User.findByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please use a different email or try logging in.',
        field: 'email'
      });
    }

    // Check if Google ID already exists (only if googleId is provided)
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

    // Create user (PostgreSQL)
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
      
      // Ensure location data exists
      const providerLocationData = locationData || {};
      const serviceLocationString = serviceLocation || 
        `${providerLocationData.street || ''}, ${providerLocationData.ward || ''}, ${providerLocationData.district || ''}, ${providerLocationData.region || ''}, Tanzania`
        .replace(/^, |, , /g, ', ').replace(/^, /, '').trim();
      
      await ServiceProvider.create({
        user_id: newUser.id,
        business_name: businessName,
        business_type: businessType || 'General Services',
        description: description || `Professional services provided by ${businessName}`,
        location: serviceLocationString,
        service_location: serviceLocationString,
        country: providerLocationData.country || 'Tanzania',
        region: providerLocationData.region || '',
        district: providerLocationData.district || '',
        area: providerLocationData.street || providerLocationData.area || '',
        ward: providerLocationData.ward || '',
        location_data: providerLocationData,
        service_categories: serviceCategories || []
      });
    }

    // Generate token
    const token = generateToken(newUser);

    // Build response with provider data if service provider
    const responseUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      userType: newUser.user_type,
      phone: newUser.phone,
      isVerified: newUser.is_verified
    };

    // Add provider data for service providers
    if (userType === 'service_provider') {
      responseUser.companyName = companyName || `${firstName} ${lastName}'s Business`;
      responseUser.businessName = companyName || `${firstName} ${lastName}'s Business`;
      responseUser.businessType = businessType || 'General Services';
      responseUser.description = description || '';
      responseUser.serviceLocation = serviceLocation || '';
      responseUser.serviceCategories = serviceCategories || [];
      responseUser.locationData = locationData || {};
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: responseUser,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle PostgreSQL unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please use a different email or try logging in.',
        field: 'email',
        code: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint - PostgreSQL version
router.post('/login', getValidationMiddleware('login'), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (PostgreSQL)
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        field: 'email'
      });
    }

    // Check if user is active (blocked/suspended by admin)
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account yako imefungiwa na Admin. Tafadhali wasiliana na support kwa msaada.',
        messageEn: 'Your account has been blocked by Admin. Please contact support for assistance.',
        field: 'account',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    // Verify password
    if (!password || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        field: 'password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        field: 'password'
      });
    }

    // Generate token
    const token = generateToken(user);

    // If service provider, get provider profile data
    let providerData = {};
    if (user.user_type === 'service_provider') {
      const provider = await ServiceProvider.findOne({ user_id: parseInt(user.id) });
      if (provider) {
        // Parse location_data if it's a string (PostgreSQL JSONB can return string)
        let locationData = provider.location_data;
        if (typeof locationData === 'string') {
          try {
            locationData = JSON.parse(locationData);
          } catch (e) {
            locationData = {};
          }
        }
        
        providerData = {
          companyName: provider.business_name || '',
          businessName: provider.business_name || '',
          businessType: provider.business_type || '',
          description: provider.description || '',
          serviceLocation: provider.service_location || provider.location || '',
          serviceCategories: provider.service_categories || [],
          locationData: locationData && typeof locationData === 'object' ? locationData : {
            region: provider.region || '',
            district: provider.district || '',
            ward: provider.ward || '',
            street: provider.area || ''
          }
        };
        console.log('📋 Provider data loaded on login:', providerData);
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        phone: user.phone,
        isVerified: user.is_verified,
        avatar: user.avatar_url,
        // Include provider data for service providers
        ...providerData
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4028';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4028';
      res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
    }
  }
);

// Get current user
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        phone: user.phone,
        isVerified: user.is_verified,
        avatar: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

module.exports = router;