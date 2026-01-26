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
      whereConditions.push(`s.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    // Add search filter if provided
    if (search) {
      whereConditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Location filtering - STRICT matching (Region + District + Ward ALL REQUIRED)
    if (region) {
      whereConditions.push(`LOWER(s.region) = LOWER($${paramIndex})`);
      queryParams.push(region);
      paramIndex++;
    }
    
    if (district) {
      // STRICT district matching - exact match required
      whereConditions.push(`LOWER(s.district) = LOWER($${paramIndex})`);
      queryParams.push(district);
      paramIndex++;
    }
    
    if (area) {
      // STRICT area/ward matching - exact match required (IYUNGA ward shows ONLY IYUNGA services, NOT IKUTI)
      whereConditions.push(`LOWER(s.area) = LOWER($${paramIndex})`);
      queryParams.push(area);
      paramIndex++;
    }
    
    // Add limit parameter
    queryParams.push(limit);
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query services table with provider information
    const result = await pool.query(`
      SELECT s.*, 
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
             u.is_verified as user_verified
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex}
    `, queryParams);
    
    console.log(`📦 Services query: region=${region || 'any'}, district=${district || 'any'}, area=${area || 'any'}, category=${category || 'all'}, search=${search || 'none'}, found=${result.rows.length}`);
    console.log(`✅ STRICT LOCATION FILTERING - Exact match at all levels (Region + District + Ward)`);
    console.log(`🔍 SQL WHERE: ${whereClause}`);
    console.log(`🔍 SQL PARAMS: ${JSON.stringify(queryParams)}`);
    
    res.json({ 
      success: true, 
      services: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to get services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name,
             u.email as provider_email,
             u.is_verified as user_verified
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE s.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true, service: result.rows[0] });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ success: false, message: 'Failed to get service' });
  }
});

// Get featured/trending services for homepage
router.get('/featured/slides', async (req, res) => {
  try {
    // Check if services table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      // Use services table if it exists
      const result = await pool.query(`
        SELECT s.*, 
               sp.business_name, 
               sp.location as provider_location,
               u.first_name as provider_first_name,
               u.last_name as provider_last_name
        FROM services s
        LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
        LEFT JOIN users u ON s.provider_id = u.id
        WHERE s.status = 'active' AND s.is_featured = true
        ORDER BY s.created_at DESC
        LIMIT 6
      `);
      
      res.json({
        success: true,
        services: result.rows,
        count: result.rows.length
      });
    } else {
      // Fallback to service_providers table
      const result = await pool.query(`
        SELECT sp.*, u.email, u.first_name, u.last_name 
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.is_active = true
        ORDER BY sp.created_at DESC
        LIMIT 6
      `);
      
      res.json({
        success: true,
        services: result.rows,
        count: result.rows.length
      });
    }
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get featured services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get provider's own services
router.get('/provider/my-services', authenticateJWT, async (req, res) => {
  try {
    console.log('📋 Fetching services for user:', req.user.id);
    
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(DISTINCT b.id) as total_bookings,
             AVG(b.rating) as average_rating
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      WHERE s.provider_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [req.user.id]);
    
    console.log(`✅ Found ${result.rows.length} services for user ${req.user.id}`);
    
    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching provider services:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new service - INHERIT location from provider profile
router.post('/', authenticateJWT, async (req, res) => {
  try {
    console.log('📝 Creating new service for user:', req.user.id);
    console.log('📦 Service data:', req.body);
    
    const {
      title,
      description,
      category,
      price,
      duration,
      maxParticipants,
      images,
      amenities,
      paymentMethods,
      contactInfo
    } = req.body;
    
    // Validate required fields
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title and price are required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    
    // Validate contact info - at least one method required
    if (!contactInfo || (!contactInfo.email?.enabled && !contactInfo.whatsapp?.enabled)) {
      return res.status(400).json({
        success: false,
        message: 'At least one contact method (email or WhatsApp) is required'
      });
    }
    
    // GET LOCATION FROM PROVIDER PROFILE - This is the key fix!
    const providerResult = await pool.query(`
      SELECT region, district, area, ward, country, location, service_location
      FROM service_providers
      WHERE user_id = $1
    `, [req.user.id]);
    
    if (providerResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provider profile not found. Please complete your profile first.'
      });
    }
    
    const provider = providerResult.rows[0];
    
    // Insert service into database with provider's location
    const result = await pool.query(`
      INSERT INTO services (
        provider_id,
        title,
        description,
        category,
        price,
        duration,
        max_participants,
        location,
        region,
        district,
        area,
        country,
        images,
        amenities,
        payment_methods,
        contact_info,
        status,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      req.user.id,
      title,
      description || '',
      category,
      price,
      duration || null,
      maxParticipants || null,
      provider.service_location || provider.location || 'Tanzania',
      provider.region || '',
      provider.district || '',
      provider.area || provider.ward || '',
      provider.country || 'Tanzania',
      JSON.stringify(images || []),
      JSON.stringify(amenities || []),
      JSON.stringify(paymentMethods || {}),
      JSON.stringify(contactInfo || {}),
      'active',
      true
    ]);
    
    console.log('✅ Service created successfully with provider location:', result.rows[0].id);
    console.log(`   Region: ${provider.region}, District: ${provider.district}, Area: ${provider.area}`);
    
    res.json({
      success: true,
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error creating service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update service status (activate/pause)
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    console.log(`🔄 Updating service ${id} status to:`, is_active);
    
    // Verify service belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND provider_id = $2',
      [id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission to modify it'
      });
    }
    
    // Update status
    const result = await pool.query(
      'UPDATE services SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND provider_id = $3 RETURNING *',
      [is_active, id, req.user.id]
    );
    
    console.log('✅ Service status updated successfully');
    
    res.json({
      success: true,
      message: `Service ${is_active ? 'activated' : 'paused'} successfully`,
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating service status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update service status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update service - location cannot be changed (inherited from provider)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating service ${id} for user:`, req.user.id);
    
    const {
      title,
      description,
      category,
      price,
      duration,
      maxParticipants,
      images,
      amenities,
      paymentMethods,
      contactInfo
    } = req.body;
    
    // Verify service belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND provider_id = $2',
      [id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission to modify it'
      });
    }
    
    // Update service - NOTE: location fields are NOT updated (they come from provider profile)
    const result = await pool.query(`
      UPDATE services SET
        title = $1,
        description = $2,
        category = $3,
        price = $4,
        duration = $5,
        max_participants = $6,
        images = $7,
        amenities = $8,
        payment_methods = $9,
        contact_info = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND provider_id = $12
      RETURNING *
    `, [
      title,
      description || '',
      category,
      price,
      duration || null,
      maxParticipants || null,
      JSON.stringify(images || []),
      JSON.stringify(amenities || []),
      JSON.stringify(paymentMethods || {}),
      JSON.stringify(contactInfo || {}),
      id,
      req.user.id
    ]);
    
    console.log('✅ Service updated successfully (location inherited from provider profile)');
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete service
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting service ${id} for user:`, req.user.id);
    
    // Verify service belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND provider_id = $2',
      [id, req.user.id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission to delete it'
      });
    }
    
    // Delete service
    await pool.query(
      'DELETE FROM services WHERE id = $1 AND provider_id = $2',
      [id, req.user.id]
    );
    
    console.log('✅ Service deleted successfully');
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
