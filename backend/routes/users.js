const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { User, ServiceProvider } = require('../models');
const { serializeDocument, isValidObjectId, toObjectId } = require('../utils/pg-helpers');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Get user profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('👤 [GET PROFILE] User:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // If service provider, get provider profile
    let providerProfile = null;
    if (user.user_type === 'service_provider') {
      providerProfile = await ServiceProvider.findOne({ user_id: parseInt(userId) });
      console.log('👤 [GET PROFILE] Provider profile found:', providerProfile ? 'Yes' : 'No');
      
      // IMPORTANT: Parse location_data if it's a string (PostgreSQL JSONB can return string)
      if (providerProfile && providerProfile.location_data) {
        if (typeof providerProfile.location_data === 'string') {
          try {
            providerProfile.location_data = JSON.parse(providerProfile.location_data);
          } catch (e) {
            console.log('⚠️ [GET PROFILE] Could not parse location_data:', e.message);
            providerProfile.location_data = {};
          }
        }
      }
      
      if (providerProfile) {
        console.log('📋 Provider data:', {
          business_name: providerProfile.business_name,
          service_location: providerProfile.service_location,
          service_categories: providerProfile.service_categories,
          location_data: providerProfile.location_data,
          region: providerProfile.region,
          district: providerProfile.district,
          area: providerProfile.area
        });
      }
    }

    // Build location_data object - prioritize parsed location_data, fallback to individual fields
    const locationDataObj = providerProfile?.location_data && typeof providerProfile.location_data === 'object' 
      ? providerProfile.location_data 
      : {
          region: providerProfile?.region || '',
          district: providerProfile?.district || '',
          ward: providerProfile?.ward || '',
          street: providerProfile?.area || ''
        };
    
    // Build response with provider data for frontend - FLATTEN provider data into user object
    const responseUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      userType: user.user_type,
      isVerified: user.is_verified,
      avatar: user.avatar_url,
      // FLATTEN provider data directly into user object for frontend compatibility
      companyName: providerProfile?.business_name || '',
      businessName: providerProfile?.business_name || '',
      businessType: providerProfile?.business_type || '',
      description: providerProfile?.description || '',
      serviceLocation: providerProfile?.service_location || providerProfile?.location || '',
      serviceCategories: providerProfile?.service_categories || [],
      locationData: locationDataObj,
      // Include provider profile data if exists (for backward compatibility)
      provider: providerProfile ? {
        id: providerProfile.id,
        business_name: providerProfile.business_name,
        business_type: providerProfile.business_type,
        description: providerProfile.description,
        location: providerProfile.location || providerProfile.service_location,
        service_location: providerProfile.service_location,
        country: providerProfile.country,
        region: providerProfile.region,
        district: providerProfile.district,
        area: providerProfile.area,
        ward: providerProfile.ward,
        location_data: locationDataObj,
        service_categories: providerProfile.service_categories || [],
        license_number: providerProfile.license_number,
        rating: providerProfile.rating,
        total_bookings: providerProfile.total_bookings,
        is_verified: providerProfile.is_verified
      } : null
    };

    console.log('✅ [GET PROFILE] Returning user with flattened provider data:', {
      companyName: responseUser.companyName,
      serviceLocation: responseUser.serviceLocation,
      serviceCategories: responseUser.serviceCategories
    });

    res.json({
      success: true,
      user: responseUser
    });
  } catch (error) {
    console.error('❌ GET PROFILE Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', [authenticateJWT, body('email').optional().isEmail()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.id;
    const { 
      first_name, firstName, last_name, lastName, phone, avatar_url, profileImage,
      // Provider profile fields
      companyName, businessType, description, serviceLocation, serviceCategories, locationData
    } = req.body;

    console.log('✏️ [UPDATE PROFILE] User:', userId);
    console.log('📋 [UPDATE PROFILE] Data received:', { 
      firstName: firstName || first_name, 
      lastName: lastName || last_name,
      companyName, 
      serviceLocation, 
      locationData,
      serviceCategories 
    });

    // Update user data
    const userUpdateData = {};
    if (first_name || firstName) userUpdateData.first_name = first_name || firstName;
    if (last_name || lastName) userUpdateData.last_name = last_name || lastName;
    if (phone) userUpdateData.phone = phone;
    if (avatar_url || profileImage) userUpdateData.avatar_url = avatar_url || profileImage;

    const user = await User.findByIdAndUpdate(userId, userUpdateData);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If service provider, also update provider profile
    if (user.user_type === 'service_provider') {
      let provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });
      
      if (provider) {
        const providerUpdateData = {};
        
        if (companyName) providerUpdateData.business_name = companyName;
        if (businessType) providerUpdateData.business_type = businessType;
        if (description) providerUpdateData.description = description;
        if (serviceCategories) providerUpdateData.service_categories = serviceCategories;
        
        // Handle location data
        if (locationData) {
          providerUpdateData.region = locationData.region || '';
          providerUpdateData.district = locationData.district || '';
          providerUpdateData.ward = locationData.ward || '';
          providerUpdateData.area = locationData.street || locationData.area || '';
          providerUpdateData.location_data = JSON.stringify(locationData);
          
          // Build full location string
          const locationParts = [
            locationData.street,
            locationData.ward,
            locationData.district,
            locationData.region,
            'Tanzania'
          ].filter(Boolean);
          providerUpdateData.location = locationParts.join(', ');
          providerUpdateData.service_location = locationParts.join(', ');
        } else if (serviceLocation) {
          providerUpdateData.location = serviceLocation;
          providerUpdateData.service_location = serviceLocation;
        }
        
        if (Object.keys(providerUpdateData).length > 0) {
          await ServiceProvider.findByIdAndUpdate(provider.id, providerUpdateData);
          console.log('✅ [UPDATE PROFILE] Provider profile updated:', providerUpdateData);
        }
      } else {
        // Create provider profile if it doesn't exist
        console.log('📝 [UPDATE PROFILE] Creating new provider profile');
        const newProviderData = {
          user_id: parseInt(userId),
          business_name: companyName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'My Business',
          business_type: businessType || 'General Services',
          description: description || '',
          service_categories: serviceCategories || ['General'],
          country: 'Tanzania'
        };
        
        if (locationData) {
          newProviderData.region = locationData.region || '';
          newProviderData.district = locationData.district || '';
          newProviderData.ward = locationData.ward || '';
          newProviderData.area = locationData.street || locationData.area || '';
          newProviderData.location_data = JSON.stringify(locationData);
          
          const locationParts = [
            locationData.street,
            locationData.ward,
            locationData.district,
            locationData.region,
            'Tanzania'
          ].filter(Boolean);
          newProviderData.location = locationParts.join(', ');
          newProviderData.service_location = locationParts.join(', ');
        }
        
        await ServiceProvider.create(newProviderData);
        console.log('✅ [UPDATE PROFILE] New provider profile created');
      }
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    console.log('✅ Profile updated');

    res.json({ success: true, message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('❌ UPDATE PROFILE Error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Change password
router.post('/change-password', [
  authenticateJWT,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    console.log('🔒 [CHANGE PASSWORD] User:', userId);

    const user = await User.findById(userId);
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Cannot change password for this account' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    console.log('✅ Password changed');

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ CHANGE PASSWORD Error:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// Get all users (admin only - simplified)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { page = 1, limit = 20, user_type } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 20;
    const offset = (pageNum - 1) * pageLimit;

    // Get users using PostgreSQL
    let users = await User.find({});
    
    // Filter by user_type if provided
    if (user_type) {
      users = users.filter(u => u.user_type === user_type);
    }

    const total = users.length;
    
    // Paginate and remove passwords
    const paginatedUsers = users.slice(offset, offset + pageLimit).map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      users: paginatedUsers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageLimit)
    });
  } catch (error) {
    console.error('❌ GET USERS Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Add provider to favorites
router.post('/favorites', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider_id } = req.body;

    console.log('❤️ [ADD FAVORITE] User:', userId, 'Provider:', provider_id);

    if (!provider_id) {
      return res.status(400).json({ success: false, message: 'Provider ID is required' });
    }

    // Get user's current favorites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize favorites array if it doesn't exist
    let favorites = user.favorite_providers || [];
    
    // Check if already favorited
    if (favorites.includes(provider_id)) {
      return res.json({ success: true, message: 'Already in favorites' });
    }

    // Add to favorites
    favorites.push(provider_id);
    await User.update(userId, { favorite_providers: favorites });

    console.log('✅ [ADD FAVORITE] Added successfully');
    res.json({ success: true, message: 'Provider added to favorites' });
  } catch (error) {
    console.error('❌ ADD FAVORITE Error:', error);
    res.status(500).json({ success: false, message: 'Error adding favorite' });
  }
});

// Remove provider from favorites
router.delete('/favorites/:providerId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const providerId = parseInt(req.params.providerId);

    console.log('💔 [REMOVE FAVORITE] User:', userId, 'Provider:', providerId);

    // Get user's current favorites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove from favorites
    let favorites = user.favorite_providers || [];
    favorites = favorites.filter(id => id !== providerId);
    
    await User.update(userId, { favorite_providers: favorites });

    console.log('✅ [REMOVE FAVORITE] Removed successfully');
    res.json({ success: true, message: 'Provider removed from favorites' });
  } catch (error) {
    console.error('❌ REMOVE FAVORITE Error:', error);
    res.status(500).json({ success: false, message: 'Error removing favorite' });
  }
});

// Get user's favorite providers
router.get('/favorites', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('❤️ [GET FAVORITES] User:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const favoriteIds = user.favorite_providers || [];
    
    // Fetch provider details
    const providers = [];
    for (const providerId of favoriteIds) {
      const provider = await ServiceProvider.findById(providerId);
      if (provider) {
        providers.push({
          id: provider.id,
          business_name: provider.business_name,
          location: provider.location || provider.service_location,
          is_verified: provider.is_verified,
          followers_count: provider.followers_count || 0
        });
      }
    }

    console.log('✅ [GET FAVORITES] Found', providers.length, 'favorites');
    res.json({ success: true, favorites: providers });
  } catch (error) {
    console.error('❌ GET FAVORITES Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching favorites' });
  }
});

module.exports = router;
