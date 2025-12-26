const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { Service, ServiceProvider, User, ServicePromotion } = require('../models');
// User is already imported above for auto-creating provider profiles
const { 
  getPagination, 
  buildServiceFilter, 
  buildSort,
  serializeDocument,
  serializeDocuments,
  isValidObjectId,
  toObjectId,
  paginationResponse 
} = require('../utils/pg-helpers');

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Location validation middleware - validates and logs location parameters
const validateLocationParams = (req, res, next) => {
  const { region, district, location } = req.query;
  
  // If any location param is provided, validate the hierarchy
  if (region || district || location) {
    // Log location params for debugging
    console.log('📍 [LOCATION VALIDATION] Params received:', { region, district, location });
    
    // Warning: If district is provided without region
    if (district && !region) {
      console.warn('⚠️ [LOCATION VALIDATION] District provided without region - may return unexpected results');
    }
    
    // Warning: If area/location is provided without district or region
    if (location && !district && !region) {
      console.warn('⚠️ [LOCATION VALIDATION] Area/location provided without district/region - may return unexpected results');
    }
    
    // Validate that region is provided for location-based queries (recommended)
    if ((district || location) && !region) {
      console.warn('⚠️ [LOCATION VALIDATION] For best results, always provide region as the primary filter');
    }
  }
  
  next();
};

// Get all services (public endpoint) - with featured/premium prioritization
router.get('/', validateLocationParams, async (req, res) => {
  try {
    const { category, location, district, region, minPrice, maxPrice, page = 1, limit = 10, search, sortBy, provider_id } = req.query;
    
    console.log('📊 [GET SERVICES] ========================================');
    console.log('📊 [GET SERVICES] STRICT Filtering with params:', { 
      category: category || 'none', 
      location: location || 'none', 
      district: district || 'none', 
      region: region || 'none', 
      page, 
      limit, 
      provider_id: provider_id || 'none' 
    });

    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const offset = (pageNum - 1) * pageLimit;

    // Get services with provider details using PostgreSQL
    const services = await Service.findWithProvider({ is_active: true });
    console.log(`📊 [GET SERVICES] Total active services in DB: ${services.length}`);
    
    // Apply filters - STRICT MODE (no fallback)
    let filteredServices = services;
    let locationFilterApplied = false;
    
    // Filter by provider_id if specified
    if (provider_id) {
      filteredServices = filteredServices.filter(s => s.provider_id === parseInt(provider_id));
      console.log(`👤 [GET SERVICES] Provider filter: ${filteredServices.length} services`);
    }
    
    // Filter by category - CASE-INSENSITIVE (must match)
    if (category) {
      const beforeCategoryFilter = filteredServices.length;
      const categoryLower = category.toLowerCase().trim();
      filteredServices = filteredServices.filter(s => {
        const serviceCategory = (s.category || '').toLowerCase().trim();
        return serviceCategory === categoryLower;
      });
      console.log(`🏷️ [GET SERVICES] Category filter "${category}": ${beforeCategoryFilter} -> ${filteredServices.length} services`);
    }
    
    // Filter by location - STRICT HIERARCHICAL MATCHING
    // Services MUST match the requested location exactly (case-insensitive)
    // Hierarchical fallback: region-level services appear for all districts/areas within that region
    if (location || district || region) {
      const beforeLocationFilter = filteredServices.length;
      
      // Helper function to normalize location strings for comparison (case-insensitive, trimmed)
      const normalize = (str) => (str || '').toLowerCase().trim();
      
      filteredServices = filteredServices.filter(s => {
        // Get service location fields (normalized)
        const serviceRegion = normalize(s.region);
        const serviceDistrict = normalize(s.district);
        const serviceArea = normalize(s.area);
        
        // HANDLE MISMATCHED DATA: Exclude services without region
        // Services without region cannot be properly filtered by location
        if (!serviceRegion) {
          console.warn(`   ⚠️ Service "${s.title}" (ID: ${s.id}) has no region set - excluding from location-filtered results`);
          return false;
        }
        
        // Get search parameters (normalized)
        const searchRegion = normalize(region);
        const searchDistrict = normalize(district);
        const searchArea = normalize(location); // 'location' param is actually area/sublocation
        
        // If no location params provided, match all
        if (!searchRegion && !searchDistrict && !searchArea) {
          return true;
        }
        
        // STRICT MATCHING RULES:
        
        // Rule 1: If region is provided, service.region MUST match EXACTLY
        // This is the PRIMARY filter - services from different regions are NEVER shown
        if (searchRegion) {
          if (serviceRegion !== searchRegion) {
            console.log(`   ❌ Service "${s.title}" rejected: region mismatch (service="${serviceRegion}", search="${searchRegion}")`);
            return false;
          }
        }
        
        // Rule 2: If district is provided, check hierarchical match
        // Service must have matching district OR be a region-level service (no district set)
        if (searchDistrict) {
          const districtMatch = serviceDistrict === searchDistrict;
          const regionLevelService = !serviceDistrict; // Service has no district = region-level
          
          if (!districtMatch && !regionLevelService) {
            console.log(`   ❌ Service "${s.title}" rejected: district mismatch (service="${serviceDistrict}", search="${searchDistrict}")`);
            return false;
          }
        }
        
        // Rule 3: If area is provided, check hierarchical match
        // Service must have matching area OR be district-level OR be region-level
        if (searchArea) {
          const areaMatch = serviceArea === searchArea;
          const districtLevelService = !serviceArea && serviceDistrict === searchDistrict;
          const regionLevelService = !serviceArea && !serviceDistrict;
          
          if (!areaMatch && !districtLevelService && !regionLevelService) {
            console.log(`   ❌ Service "${s.title}" rejected: area mismatch (service="${serviceArea}", search="${searchArea}")`);
            return false;
          }
        }
        
        console.log(`   ✅ Service "${s.title}" MATCHED (region="${serviceRegion}", district="${serviceDistrict}", area="${serviceArea}")`);
        return true;
      });
      
      locationFilterApplied = true;
      console.log(`📍 STRICT Location filter applied:`);
      console.log(`   - Region param: "${region || 'none'}"`);
      console.log(`   - District param: "${district || 'none'}"`);
      console.log(`   - Area/Location param: "${location || 'none'}"`);
      console.log(`   - Before: ${beforeLocationFilter} services`);
      console.log(`   - After: ${filteredServices.length} services`);
      
      // If no services found, log helpful info for debugging
      if (filteredServices.length === 0) {
        console.log(`   ⚠️ No services found for this location. Available services in DB:`);
        services.slice(0, 10).forEach(s => {
          console.log(`      - "${s.title}": region="${s.region}", district="${s.district}", area="${s.area}", category="${s.category}"`);
        });
      }
    }
    if (minPrice) {
      filteredServices = filteredServices.filter(s => s.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredServices = filteredServices.filter(s => s.price <= parseFloat(maxPrice));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(s => 
        s.title?.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredServices.length;
    const paginatedServices = filteredServices.slice(offset, offset + pageLimit);

    // Format response - include ALL location fields for frontend filtering
    const enrichedServices = paginatedServices.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory,
      price: service.price,
      currency: service.currency,
      duration: service.duration,
      location: service.location,
      region: service.region,
      district: service.district,  // ADDED: Include district for filtering
      area: service.area,          // ADDED: Include area for filtering
      country: service.country,    // ADDED: Include country
      images: service.images || [],
      amenities: service.amenities || [],
      is_active: service.is_active,
      is_featured: service.is_featured,
      average_rating: service.average_rating,
      views_count: service.views_count,
      created_at: service.created_at,
      // Provider info
      provider_id: service.provider_id,
      provider_name: service.provider_name,
      business_name: service.business_name,
      provider_rating: service.provider_rating,
      provider_verified: service.provider_verified === true,
      is_verified: service.provider_verified === true,
      verified: service.provider_verified === true,
      // Payment methods and contact info for traveler display
      payment_methods: typeof service.payment_methods === 'string' 
        ? JSON.parse(service.payment_methods || '{}') 
        : (service.payment_methods || {}),
      contact_info: typeof service.contact_info === 'string' 
        ? JSON.parse(service.contact_info || '{}') 
        : (service.contact_info || {})
    }));

    console.log(`✅ [GET SERVICES] Returning ${enrichedServices.length} services`);
    console.log('📊 [GET SERVICES] ========================================');

    res.json({
      success: true,
      services: enrichedServices,
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
      locationFilterApplied: locationFilterApplied || false,
      filters: {
        category: category || null,
        location: location || null,
        district: district || null,
        region: region || null
      }
    });
  } catch (error) {
    console.error('❌ [GET SERVICES] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    console.log('🔍 [GET SERVICE] Fetching service:', serviceId);

    // Get service with provider details
    const service = await Service.findByIdWithProvider(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment views count
    await Service.findByIdAndUpdate(serviceId, { views_count: (service.views_count || 0) + 1 });

    // Get provider user details if needed
    let providerUser = null;
    if (service.provider_user_id) {
      providerUser = await User.findById(service.provider_user_id);
    }

    const enrichedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory,
      price: service.price,
      currency: service.currency,
      duration: service.duration,
      max_participants: service.max_participants,
      location: service.location,
      country: service.country,
      region: service.region,
      district: service.district,
      area: service.area,
      images: service.images || [],
      amenities: service.amenities || [],
      is_active: service.is_active,
      is_featured: service.is_featured,
      average_rating: service.average_rating,
      views_count: service.views_count,
      created_at: service.created_at,
      business_name: service.business_name,
      provider_rating: service.provider_rating,
      provider_location: service.provider_location,
      provider_first_name: providerUser?.first_name,
      provider_last_name: providerUser?.last_name,
      provider_email: providerUser?.email,
      provider_phone: providerUser?.phone,
      // Payment methods and contact info
      payment_methods: service.payment_methods || {},
      contact_info: service.contact_info || {}
    };

    console.log('✅ [GET SERVICE] Service found');

    res.json({
      success: true,
      service: enrichedService
    });
  } catch (error) {
    console.error('❌ [GET SERVICE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service'
    });
  }
});

// Get services by provider (requires authentication)
router.get('/provider/my-services', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('👤 [MY SERVICES] Fetching services for user:', userId);

    // Find provider by user_id
    const provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });

    if (!provider) {
      // Return empty array instead of error - provider profile will be created when adding first service
      console.log('👤 [MY SERVICES] No provider profile yet, returning empty services');
      return res.json({
        success: true,
        services: [],
        message: 'No provider profile yet. Add your first service to get started!'
      });
    }

    // Get all services for this provider using PostgreSQL
    const services = await Service.find({ provider_id: provider.id });

    console.log(`✅ [MY SERVICES] Found ${services.length} services`);

    res.json({
      success: true,
      services: services.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        price: s.price,
        currency: s.currency,
        location: s.location,
        images: s.images || [],
        is_active: s.is_active,
        is_featured: s.is_featured,
        average_rating: s.average_rating,
        created_at: s.created_at
      }))
    });
  } catch (error) {
    console.error('❌ [MY SERVICES] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

// Create new service (service providers only)
router.post('/', [
  authenticateJWT,
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').trim().isLength({ min: 1 }),
  body('category').trim().notEmpty(),
  body('price').isNumeric(),
  body('region').trim().notEmpty().withMessage('Region is required for service location')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      title, description, category, subcategory, price, currency,
      duration, maxParticipants, location, country, region, district, area,
      images, amenities, paymentMethods, contactInfo
    } = req.body;

    console.log('➕ [CREATE SERVICE] Creating service for user:', userId);
    console.log('📍 [CREATE SERVICE] Location data:', { region, district, area, location });
    console.log('💳 Payment methods:', paymentMethods);
    console.log('📞 Contact info:', contactInfo);

    // Validate region is provided (required for location filtering)
    if (!region || region.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Region is required. Please specify the region where this service is available.'
      });
    }

    // Find provider or create one if user is a service_provider type
    let provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });

    if (!provider) {
      // Check if user is a service provider type
      const user = await User.findById(parseInt(userId));
      
      if (!user || user.user_type !== 'service_provider') {
        return res.status(403).json({
          success: false,
          message: 'Only service providers can create services'
        });
      }

      // Auto-create provider profile for service_provider users
      console.log('📝 [CREATE SERVICE] Auto-creating provider profile for user:', userId);
      provider = await ServiceProvider.create({
        user_id: parseInt(userId),
        business_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'My Business',
        business_type: 'General Services',
        description: 'Professional services',
        location: location || 'Tanzania',
        service_location: location || 'Tanzania',
        country: country || 'Tanzania',
        region: region || '',
        district: district || '',
        area: area || '',
        service_categories: category ? [category] : ['General'],
        is_verified: false
      });
      console.log('✅ [CREATE SERVICE] Provider profile created:', provider.id);
    }

    // Create service using PostgreSQL
    const newService = await Service.create({
      provider_id: provider.id,
      title,
      description,
      category,
      subcategory,
      price: parseFloat(price),
      currency: currency || 'TZS',
      duration,
      max_participants: maxParticipants,
      location,
      country,
      region,
      district,
      area,
      images: images || [],
      amenities: amenities || [],
      payment_methods: paymentMethods || {},
      contact_info: contactInfo || {}
    });

    console.log('✅ [CREATE SERVICE] Service created:', newService.id);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        id: newService.id,
        title: newService.title,
        description: newService.description,
        category: newService.category,
        price: newService.price,
        location: newService.location,
        images: newService.images || [],
        created_at: newService.created_at
      }
    });
  } catch (error) {
    console.error('❌ [CREATE SERVICE] Error:', error);
    console.error('❌ [CREATE SERVICE] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating service: ' + (error.message || 'Unknown error')
    });
  }
});

// Update service (service providers only)
router.put('/:id', [
  authenticateJWT,
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const serviceId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    console.log('✏️ [UPDATE SERVICE] Updating service:', serviceId);

    // Find provider
    const provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Service provider profile not found'
      });
    }

    // Find service and verify ownership
    const service = await Service.findById(serviceId);

    if (!service || service.provider_id !== provider.id) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission to update it'
      });
    }

    // Build update data
    const updateData = {};
    const fieldMapping = {
      'title': 'title',
      'description': 'description',
      'category': 'category',
      'subcategory': 'subcategory',
      'price': 'price',
      'currency': 'currency',
      'duration': 'duration',
      'maxParticipants': 'max_participants',
      'location': 'location',
      'country': 'country',
      'region': 'region',
      'district': 'district',
      'area': 'area',
      'images': 'images',
      'amenities': 'amenities',
      'paymentMethods': 'payment_methods',
      'contactInfo': 'contact_info'
    };

    Object.keys(fieldMapping).forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[fieldMapping[field]] = req.body[field];
      }
    });

    // Update using PostgreSQL
    const updatedService = await Service.findByIdAndUpdate(serviceId, updateData);

    console.log('✅ [UPDATE SERVICE] Service updated');

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: {
        id: updatedService.id,
        title: updatedService.title,
        description: updatedService.description,
        category: updatedService.category,
        price: updatedService.price,
        location: updatedService.location,
        images: updatedService.images || []
      }
    });
  } catch (error) {
    console.error('❌ [UPDATE SERVICE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service'
    });
  }
});

// Delete service (service providers only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    console.log('🗑️ [DELETE SERVICE] Deleting service:', serviceId);

    // Find provider
    const provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Service provider profile not found'
      });
    }

    // Find service first to verify ownership
    const service = await Service.findById(serviceId);

    if (!service || service.provider_id !== provider.id) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission to delete it'
      });
    }

    // Delete service using PostgreSQL
    await Service.findByIdAndDelete(serviceId);

    console.log('✅ [DELETE SERVICE] Service deleted');

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('❌ [DELETE SERVICE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service'
    });
  }
});

// Promote service (make it featured) - requires payment and admin approval
router.post('/:id/promote', authenticateJWT, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const { 
      promotion_type,
      duration_days = 30,
      location,
      payment_method = 'card',
      payment_reference,
      amount,
      card_last_four,
      card_brand,
      card_holder
    } = req.body;

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    console.log('⭐ [PROMOTE SERVICE] Creating promotion request:', { serviceId, promotion_type, location, payment_method });

    // Calculate cost
    let totalCost = amount || 50000;
    if (promotion_type === 'featured') {
      totalCost = 50000;
    } else if (promotion_type === 'trending') {
      totalCost = 30000;
    } else if (promotion_type === 'search_boost') {
      totalCost = 20000;
    }

    // Find provider and service
    const provider = await ServiceProvider.findOne({ user_id: parseInt(req.user.id) });
    const service = await Service.findById(serviceId);

    if (!service || service.provider_id !== provider.id) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Calculate featured until date (will be set when admin approves)
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + duration_days);

    // Create service_promotions table if not exists
    const { pool } = require('../config/postgresql');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_promotions (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id),
        promotion_type VARCHAR(50),
        promotion_location VARCHAR(100),
        duration_days INTEGER DEFAULT 30,
        cost DECIMAL(10,2),
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'pending',
        card_last_four VARCHAR(4),
        card_brand VARCHAR(20),
        card_holder VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        started_at TIMESTAMP,
        expires_at TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by INTEGER,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create promotion record with PENDING status (awaiting admin approval)
    const result = await pool.query(`
      INSERT INTO service_promotions (
        service_id, promotion_type, promotion_location, duration_days, cost,
        payment_method, payment_reference, payment_status, card_last_four, card_brand, card_holder,
        status, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      service.id,
      promotion_type,
      location,
      duration_days,
      totalCost,
      payment_method,
      payment_reference || `CARD-${Date.now()}`,
      'completed', // Payment is completed when card details are submitted
      card_last_four || null,
      card_brand || null,
      card_holder || null,
      'pending', // Status is pending until admin approves
      featuredUntil
    ]);

    console.log('✅ [PROMOTE SERVICE] Promotion request created, awaiting admin approval');

    res.json({
      success: true,
      message: 'Promotion request submitted successfully. Awaiting admin approval.',
      promotion: {
        id: result.rows[0].id,
        service_id: serviceId,
        promotion_type,
        location,
        duration_days,
        cost: totalCost,
        status: 'pending',
        payment_status: 'completed'
      }
    });
  } catch (error) {
    console.error('❌ [PROMOTE SERVICE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating promotion request'
    });
  }
});

// Get featured/promoted services for homepage slides
router.get('/featured/slides', async (req, res) => {
  try {
    // Get featured services using PostgreSQL
    const services = await Service.getFeatured(5);

    console.log(`🎠 Featured slides: Found ${services.length} promoted services for homepage`);

    // Format response
    const enrichedServices = services.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      images: service.images || [],
      is_featured: service.is_featured,
      average_rating: service.average_rating,
      business_name: service.business_name,
      provider_id: service.provider_id,
      provider_rating: service.provider_rating,
      provider_verified: service.provider_verified === true,
      is_verified: service.provider_verified === true,
      verified: service.provider_verified === true
    }));

    res.json({
      success: true,
      slides: enrichedServices
    });
  } catch (error) {
    console.error('Get featured slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured services'
    });
  }
});

// Get trending promoted services for homepage
router.get('/trending-backup', async (req, res) => {
  try {
    // Get any active services as trending using PostgreSQL
    const services = await Service.findWithProvider({ is_active: true });
    const limitedServices = services.slice(0, 6);
    
    console.log(`📈 Trending backup: Found ${limitedServices.length} services`);
    
    const enrichedServices = limitedServices.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      images: service.images || [],
      average_rating: service.average_rating || 4.5,
      business_name: service.business_name,
      provider_id: service.provider_id,
      provider_rating: service.provider_rating,
      provider_verified: service.provider_verified === true,
      is_verified: service.provider_verified === true,
      verified: service.provider_verified === true
    }));
    
    res.json({
      success: true,
      services: enrichedServices
    });
  } catch (error) {
    console.error('Get trending backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending services'
    });
  }
});

router.get('/trending', async (req, res) => {
  try {
    // Get trending services using PostgreSQL
    const allServices = await Service.findWithProvider({ is_active: true });
    
    // Filter for trending/featured services
    const trendingServices = allServices
      .filter(s => s.is_featured || s.views_count > 0)
      .slice(0, 12);

    console.log(`📈 Trending services: Found ${trendingServices.length} trending services`);

    const enrichedServices = trendingServices.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      currency: service.currency,
      location: service.location,
      images: service.images || [],
      is_featured: service.is_featured,
      average_rating: service.average_rating,
      views_count: service.views_count,
      business_name: service.business_name,
      provider_id: service.provider_id,
      provider_rating: service.provider_rating,
      provider_verified: service.provider_verified === true,
      is_verified: service.provider_verified === true,
      verified: service.provider_verified === true
    }));

    res.json({
      success: true,
      services: enrichedServices
    });
  } catch (error) {
    console.error('Get trending services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trending services'
    });
  }
});

// Get all service categories
router.get('/categories', async (req, res) => {
  try {
    const { pool } = require('../config/postgresql');
    const result = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM services 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    const categories = result.rows.map(r => ({
      id: r.category,
      name: r.category,
      count: parseInt(r.count)
    }));

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

// Get all destinations
router.get('/destinations', async (req, res) => {
  try {
    const { pool } = require('../config/postgresql');
    const result = await pool.query(`
      SELECT DISTINCT location, region, COUNT(*) as count 
      FROM services 
      WHERE location IS NOT NULL 
      GROUP BY location, region 
      ORDER BY count DESC
      LIMIT 50
    `);
    
    const destinations = result.rows.map(r => ({
      id: r.location,
      name: r.location,
      region: r.region,
      count: parseInt(r.count)
    }));

    res.json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ success: false, message: 'Error fetching destinations' });
  }
});

// Get services by location with providers - for journey planner - STRICT FILTERING
router.get('/by-location', validateLocationParams, async (req, res) => {
  try {
    const { region, district, ward, category, limit = 50 } = req.query;
    
    console.log('📍 [SERVICES BY LOCATION] STRICT Query:', { region, district, ward, category });
    
    // Get all services with provider details
    const services = await Service.findWithProvider({ is_active: true });
    
    let filteredServices = services;
    let locationFilterApplied = false;
    let categoryFilterApplied = false;
    
    // STRICT Filter by location - NO FALLBACK, EXACT MATCHING
    if (region || district || ward) {
      const regionLower = (region || '').toLowerCase().trim();
      const districtLower = (district || '').toLowerCase().trim();
      const wardLower = (ward || '').toLowerCase().trim();
      
      filteredServices = filteredServices.filter(s => {
        const serviceRegion = (s.region || '').toLowerCase().trim();
        const serviceDistrict = (s.district || '').toLowerCase().trim();
        const serviceArea = (s.area || '').toLowerCase().trim();
        
        // STRICT MATCHING RULES:
        
        // Rule 1: If region is provided, service.region MUST match EXACTLY
        if (regionLower) {
          if (serviceRegion !== regionLower) {
            return false;
          }
        }
        
        // Rule 2: If district is provided, check hierarchical match
        // Service must have matching district OR be a region-level service
        if (districtLower) {
          const districtMatch = serviceDistrict === districtLower;
          const regionLevelService = !serviceDistrict; // No district = region-level
          if (!districtMatch && !regionLevelService) {
            return false;
          }
        }
        
        // Rule 3: If ward/area is provided, check hierarchical match
        // Service must have matching area OR be district-level OR be region-level
        if (wardLower) {
          const areaMatch = serviceArea === wardLower;
          const districtLevelService = !serviceArea && serviceDistrict === districtLower;
          const regionLevelService = !serviceArea && !serviceDistrict;
          if (!areaMatch && !districtLevelService && !regionLevelService) {
            return false;
          }
        }
        
        return true;
      });
      
      locationFilterApplied = true;
      console.log(`📍 STRICT Location filter: ${services.length} -> ${filteredServices.length} services`);
    }
    
    // STRICT Filter by category - NO FALLBACK
    if (category) {
      const categoryLower = category.toLowerCase().trim();
      filteredServices = filteredServices.filter(s => {
        const serviceCategory = (s.category || '').toLowerCase().trim();
        return serviceCategory === categoryLower || serviceCategory.includes(categoryLower);
      });
      categoryFilterApplied = true;
      console.log(`🏷️ STRICT Category filter "${category}": ${filteredServices.length} services`);
    }
    
    // NO FALLBACK - Return empty array if no matches found
    // This ensures strict filtering by location and category
    const limitedServices = filteredServices.slice(0, parseInt(limit));
    
    // Format response with provider info
    const enrichedServices = limitedServices.map(service => ({
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      location: service.location,
      region: service.region,
      district: service.district,
      area: service.area,
      images: service.images || [],
      provider_id: service.provider_id,
      business_name: service.business_name,
      provider_name: service.provider_name,
      provider_rating: service.provider_rating,
      provider_verified: service.provider_verified === true,
      is_verified: service.provider_verified === true,
      verified: service.provider_verified === true,
      payment_methods: typeof service.payment_methods === 'string' 
        ? JSON.parse(service.payment_methods || '{}') 
        : (service.payment_methods || {}),
      contact_info: typeof service.contact_info === 'string' 
        ? JSON.parse(service.contact_info || '{}') 
        : (service.contact_info || {})
    }));
    
    console.log(`✅ [SERVICES BY LOCATION] STRICT: Returning ${enrichedServices.length} services (no fallback)`);
    
    res.json({
      success: true,
      services: enrichedServices,
      total: enrichedServices.length,
      locationFilterApplied,
      categoryFilterApplied,
      filters: { region, district, ward, category }
    });
  } catch (error) {
    console.error('❌ [SERVICES BY LOCATION] Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});

// Toggle service status (activate/deactivate)
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    console.log('🔄 [TOGGLE STATUS] Service:', serviceId);

    // Find provider
    const provider = await ServiceProvider.findOne({ user_id: parseInt(userId) });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: 'Service provider profile not found'
      });
    }

    // Find service
    const service = await Service.findById(serviceId);

    if (!service || service.provider_id !== provider.id) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Toggle status using PostgreSQL
    const newStatus = !service.is_active;
    await Service.findByIdAndUpdate(serviceId, { is_active: newStatus });

    console.log(`✅ [TOGGLE STATUS] Service ${newStatus ? 'activated' : 'deactivated'}`);

    res.json({
      success: true,
      message: `Service ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('❌ [TOGGLE STATUS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling service status'
    });
  }
});

module.exports = router;
