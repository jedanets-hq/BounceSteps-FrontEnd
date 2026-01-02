const express = require('express');
const passport = require('passport');
const { ServiceProvider, User, Service } = require('../models');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Search providers by location and categories
router.get('/search', async (req, res) => {
  try {
    const { region, district, ward, categories, page = 1, limit = 20 } = req.query;
    
    console.log('🔍 Provider Search Query:', { region, district, ward, categories });

    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 20;
    const offset = (pageNum - 1) * pageLimit;

    // Get all providers with user details using PostgreSQL
    const allProviders = await ServiceProvider.findWithUser({});
    
    console.log(`📊 Total providers in database: ${allProviders.length}`);

    // Filter providers based on search criteria
    let filteredProviders = allProviders;

    // Location filtering - more flexible matching
    if (region || district || ward) {
      filteredProviders = filteredProviders.filter(p => {
        // Check all location fields for matches
        const locationFields = [
          p.region, p.district, p.ward, p.area, p.location, 
          p.service_location, p.country
        ].filter(Boolean).map(f => f.toLowerCase());
        
        const searchTerms = [region, district, ward].filter(Boolean).map(t => t.toLowerCase());
        
        // Match if any location field contains any search term
        const hasLocationMatch = searchTerms.some(term => 
          locationFields.some(field => field.includes(term))
        );
        
        // Also check if provider serves Tanzania (default country)
        const servesCountry = !p.country || p.country.toLowerCase().includes('tanzania');
        
        return hasLocationMatch || (searchTerms.length === 0 && servesCountry);
      });
      
      console.log(`📍 After location filter: ${filteredProviders.length} providers`);
    }

    // Service category filters
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      const beforeCategoryFilter = filteredProviders.length;
      
      filteredProviders = filteredProviders.filter(p => {
        const providerCategories = p.service_categories || [];
        const businessType = p.business_type || '';
        
        return categoryArray.some(cat => {
          const catLower = cat.toLowerCase();
          return providerCategories.some(pc => 
            pc && pc.toLowerCase().includes(catLower)
          ) || businessType.toLowerCase().includes(catLower);
        });
      });
      
      console.log(`🏷️ After category filter: ${filteredProviders.length} providers (was ${beforeCategoryFilter})`);
    }

    const total = filteredProviders.length;
    const paginatedProviders = filteredProviders.slice(offset, offset + pageLimit);

    console.log(`✅ Found ${paginatedProviders.length} providers out of ${total} total`);

    // If no providers found with specific location, return ALL providers as fallback
    if (paginatedProviders.length === 0) {
      console.log('🔄 No providers found with filters, returning all providers...');
      
      // Return all providers without any filtering
      const fallbackProviders = allProviders.slice(0, pageLimit);
      
      res.json({
        success: true,
        providers: fallbackProviders,
        total: allProviders.length,
        page: pageNum,
        totalPages: Math.ceil(allProviders.length / pageLimit),
        searchCriteria: { region, district, ward, categories },
        fallbackSearch: true,
        message: 'Showing all available providers.'
      });
    } else {
      res.json({
        success: true,
        providers: paginatedProviders,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / pageLimit),
        searchCriteria: { region, district, ward, categories }
      });
    }
  } catch (error) {
    console.error('❌ PROVIDER SEARCH Error:', error);
    res.status(500).json({ success: false, message: 'Error searching providers' });
  }
});

// Get all service providers (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, country, region } = req.query;

    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 20;
    const offset = (pageNum - 1) * pageLimit;

    // Get all providers with user details
    let providers = await ServiceProvider.findWithUser({});

    // Filter by country/region if provided
    if (country) {
      providers = providers.filter(p => p.country && p.country.toLowerCase() === country.toLowerCase());
    }
    if (region) {
      providers = providers.filter(p => p.region && p.region.toLowerCase() === region.toLowerCase());
    }

    const total = providers.length;
    const paginatedProviders = providers.slice(offset, offset + pageLimit);

    res.json({
      success: true,
      providers: paginatedProviders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageLimit)
    });
  } catch (error) {
    console.error('❌ GET PROVIDERS Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching providers' });
  }
});

// Get all providers (including unverified for admin) - MUST be before /:id route
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, verified } = req.query;

    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 20;
    const offset = (pageNum - 1) * pageLimit;

    // Get all providers with user details
    let providers = await ServiceProvider.findWithUser({});

    // Filter by verification status if provided
    if (verified !== undefined) {
      const isVerified = verified === 'true';
      providers = providers.filter(p => p.is_verified === isVerified);
    }

    const total = providers.length;
    const paginatedProviders = providers.slice(offset, offset + pageLimit);

    res.json({
      success: true,
      providers: paginatedProviders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageLimit)
    });
  } catch (error) {
    console.error('❌ GET ALL PROVIDERS Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching providers' });
  }
});

// Get provider by ID
router.get('/:id', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }

    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Get user details
    let userDetails = null;
    if (provider.user_id) {
      userDetails = await User.findById(provider.user_id);
    }

    // Get provider's services
    const services = await Service.find({ provider_id: provider.id, is_active: true });

    res.json({
      success: true,
      provider: {
        ...provider,
        user: userDetails ? {
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          email: userDetails.email,
          phone: userDetails.phone,
          avatar_url: userDetails.avatar_url
        } : null,
        services: services.slice(0, 10).map(s => ({
          id: s.id,
          title: s.title,
          category: s.category,
          price: s.price,
          location: s.location,
          images: s.images,
          average_rating: s.average_rating
        }))
      }
    });
  } catch (error) {
    console.error('❌ GET PROVIDER Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching provider' });
  }
});

// Update provider profile
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({ success: false, message: 'Only service providers can update provider profile' });
    }

    const { business_name, business_type, description, location, country, region, district, area, license_number, service_categories, location_data } = req.body;

    const provider = await ServiceProvider.findOne({ user_id: parseInt(req.user.id) });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const updateData = {};
    if (business_name) updateData.business_name = business_name;
    if (business_type) updateData.business_type = business_type;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (country) updateData.country = country;
    if (region) updateData.region = region;
    if (district) updateData.district = district;
    if (area) updateData.area = area;
    if (license_number) updateData.license_number = license_number;
    if (service_categories) updateData.service_categories = service_categories;
    if (location_data) updateData.location_data = JSON.stringify(location_data);

    const updatedProvider = await ServiceProvider.findByIdAndUpdate(provider.id, updateData);

    console.log('✅ Provider profile updated');

    res.json({ success: true, message: 'Provider profile updated successfully', provider: updatedProvider });
  } catch (error) {
    console.error('❌ UPDATE PROVIDER Error:', error);
    res.status(500).json({ success: false, message: 'Error updating provider profile' });
  }
});

// Get my followers (for service providers)
router.get('/my-followers', authenticateJWT, async (req, res) => {
  try {
    if (req.user.userType !== 'service_provider') {
      return res.status(403).json({ success: false, message: 'Only service providers can view followers' });
    }

    const provider = await ServiceProvider.findOne({ user_id: parseInt(req.user.id) });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    // Get followers from database (provider_followers table)
    const { pool } = require('../config/database');
    
    // Check if provider_followers table exists, if not return empty array
    try {
      const result = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, pf.created_at as followed_at
        FROM provider_followers pf
        JOIN users u ON pf.user_id = u.id
        WHERE pf.provider_id = $1
        ORDER BY pf.created_at DESC
      `, [provider.id]);
      
      res.json({
        success: true,
        followers: result.rows,
        count: result.rows.length
      });
    } catch (dbError) {
      // Table might not exist yet, return empty array
      console.log('Provider followers table may not exist yet:', dbError.message);
      res.json({
        success: true,
        followers: [],
        count: 0
      });
    }
  } catch (error) {
    console.error('❌ GET FOLLOWERS Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching followers' });
  }
});

// Follow a provider (for travelers)
router.post('/:id/follow', authenticateJWT, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);
    
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }

    const { pool } = require('../config/database');
    
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provider_followers (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider_id, user_id)
      )
    `);
    
    // Check if already following
    const existing = await pool.query(
      'SELECT id FROM provider_followers WHERE provider_id = $1 AND user_id = $2',
      [providerId, userId]
    );
    
    if (existing.rows.length > 0) {
      return res.json({ success: true, message: 'Already following', isFollowing: true });
    }
    
    // Add follow
    await pool.query(
      'INSERT INTO provider_followers (provider_id, user_id) VALUES ($1, $2)',
      [providerId, userId]
    );
    
    res.json({ success: true, message: 'Now following provider', isFollowing: true });
  } catch (error) {
    console.error('❌ FOLLOW PROVIDER Error:', error);
    res.status(500).json({ success: false, message: 'Error following provider' });
  }
});

// Unfollow a provider
router.delete('/:id/follow', authenticateJWT, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);
    
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }

    const { pool } = require('../config/database');
    
    await pool.query(
      'DELETE FROM provider_followers WHERE provider_id = $1 AND user_id = $2',
      [providerId, userId]
    );
    
    res.json({ success: true, message: 'Unfollowed provider', isFollowing: false });
  } catch (error) {
    console.error('❌ UNFOLLOW PROVIDER Error:', error);
    res.status(500).json({ success: false, message: 'Error unfollowing provider' });
  }
});

// Admin endpoint to verify providers (for testing)
router.post('/verify/:id', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    
    if (isNaN(providerId)) {
      return res.status(400).json({ success: false, message: 'Invalid provider ID' });
    }

    const provider = await ServiceProvider.findByIdAndUpdate(providerId, { is_verified: true });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.json({
      success: true,
      message: 'Provider verified successfully',
      provider
    });
  } catch (error) {
    console.error('❌ VERIFY PROVIDER Error:', error);
    res.status(500).json({ success: false, message: 'Error verifying provider' });
  }
});

// Follow a provider
router.post('/:id/follow', authenticateJWT, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log('👥 [FOLLOW] User:', userId, 'Provider:', providerId);

    // Get provider
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Get user's followed providers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let followedProviders = user.followed_providers || [];
    
    // Check if already following
    if (followedProviders.includes(providerId)) {
      return res.json({ success: true, message: 'Already following' });
    }

    // Add to followed list
    followedProviders.push(providerId);
    await User.update(userId, { followed_providers: followedProviders });

    // Increment provider's follower count
    const currentCount = provider.followers_count || 0;
    await ServiceProvider.update(providerId, { followers_count: currentCount + 1 });

    console.log('✅ [FOLLOW] Success');
    res.json({ 
      success: true, 
      message: 'Provider followed successfully',
      followers_count: currentCount + 1
    });
  } catch (error) {
    console.error('❌ FOLLOW Error:', error);
    res.status(500).json({ success: false, message: 'Error following provider' });
  }
});

// Unfollow a provider
router.post('/:id/unfollow', authenticateJWT, async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log('👥 [UNFOLLOW] User:', userId, 'Provider:', providerId);

    // Get provider
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Get user's followed providers
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let followedProviders = user.followed_providers || [];
    
    // Remove from followed list
    followedProviders = followedProviders.filter(id => id !== providerId);
    await User.update(userId, { followed_providers: followedProviders });

    // Decrement provider's follower count
    const currentCount = provider.followers_count || 0;
    const newCount = Math.max(0, currentCount - 1);
    await ServiceProvider.update(providerId, { followers_count: newCount });

    console.log('✅ [UNFOLLOW] Success');
    res.json({ 
      success: true, 
      message: 'Provider unfollowed successfully',
      followers_count: newCount
    });
  } catch (error) {
    console.error('❌ UNFOLLOW Error:', error);
    res.status(500).json({ success: false, message: 'Error unfollowing provider' });
  }
});

// Get provider's follower count
router.get('/:id/followers/count', async (req, res) => {
  try {
    const providerId = parseInt(req.params.id);

    console.log('👥 [GET FOLLOWER COUNT] Provider:', providerId);

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const count = provider.followers_count || 0;

    console.log('✅ [GET FOLLOWER COUNT] Count:', count);
    res.json({ success: true, count });
  } catch (error) {
    console.error('❌ GET FOLLOWER COUNT Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching follower count' });
  }
});

module.exports = router;
