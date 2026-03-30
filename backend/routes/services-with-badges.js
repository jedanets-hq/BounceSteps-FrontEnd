const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const { authenticateJWT } = require('../middleware/jwtAuth');

// Get all services
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const category = req.query.category; // Get category filter
    const search = req.query.search; // Get search query
    const region = req.query.region; // Get region filter
    const district = req.query.district; // Get district filter
    const area = req.query.area; // Get area/ward filter
    
    // Build WHERE clause dynamically
    let whereConditions = ["s.status = 'active'", "s.is_active = true"];
    let queryParams = [];
    let paramIndex = 1;
    
    // Add category filter if provided
    if (category && category !== 'all') {
      whereConditions.push(`s.category ILIKE $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    // Add search filter if provided
    if (search) {
      whereConditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Location filtering - flexible to show services in requested area
    if (region) {
      whereConditions.push(`s.region ILIKE $${paramIndex}`);
      queryParams.push(region);
      paramIndex++;
    }
    
    if (district) {
      // District can match either district OR area field (frontend ward → backend area)
      // Use ILIKE for case-insensitive matching
      whereConditions.push(`(s.district ILIKE $${paramIndex} OR s.area ILIKE $${paramIndex})`);
      queryParams.push(district);
      paramIndex++;
    }
    
    if (area) {
      // Area/ward matching - use ILIKE for case-insensitive partial matches
      // This allows "BUZURUGA" to match "BUZURUGA KASKAZINI", "Buzuruga", etc.
      whereConditions.push(`s.area ILIKE $${paramIndex}`);
      queryParams.push(`%${area}%`); // Add % for partial matching on both sides
      paramIndex++;
    }
    
    // Add limit parameter
    queryParams.push(limit);
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query services table with provider information INCLUDING avatar_url AND BADGE
    const result = await pool.query(`
      SELECT s.*, 
             sp.id as service_provider_id,
             sp.user_id as provider_user_id,
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area,
             sp.service_categories as provider_service_categories,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name,
             u.email as provider_email,
             u.avatar_url,
             u.is_verified as user_verified,
             pb.badge_type as provider_badge_type
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.id
      INNER JOIN users u ON sp.user_id = u.id
      LEFT JOIN provider_badges pb ON sp.id = pb.provider_id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex}
    `, queryParams);
    
    console.log(`📦 Services query: region=${region || 'any'}, district=${district || 'any'}, area=${area || 'any'}, category=${category || 'all'}, search=${search || 'none'}, found=${result.rows.length}`);
    console.log(`✅ FLEXIBLE FILTERING - Providers can offer ANY service category`);
    
    // Parse JSON fields that are stored as TEXT
    const parsedServices = result.rows.map(service => ({
      ...service,
      images: service.images ? (typeof service.images === 'string' ? JSON.parse(service.images) : service.images) : [],
      amenities: service.amenities ? (typeof service.amenities === 'string' ? JSON.parse(service.amenities) : service.amenities) : [],
      payment_methods: service.payment_methods ? (typeof service.payment_methods === 'string' ? JSON.parse(service.payment_methods) : service.payment_methods) : {},
      contact_info: service.contact_info ? (typeof service.contact_info === 'string' ? JSON.parse(service.contact_info) : service.contact_info) : {}
    }));
    
    res.json({ 
      success: true, 
      services: parsedServices,
      count: parsedServices.length
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to get services' });
  }
});

module.exports = router;
