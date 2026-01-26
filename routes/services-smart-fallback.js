const express = require('express');
const router = express.Router();
const { pool } = require('../models');
const { authenticateJWT } = require('../middleware/jwtAuth');

// Get all services with SMART FALLBACK
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const category = req.query.category;
    const search = req.query.search;
    const region = req.query.region;
    const district = req.query.district;
    const area = req.query.area; // ward
    
    let whereConditions = ["s.status = 'active'", "s.is_active = true"];
    let queryParams = [];
    let paramIndex = 1;
    
    // Category filter
    if (category && category !== 'all') {
      whereConditions.push(`s.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    // Search filter
    if (search) {
      whereConditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // SMART LOCATION FILTERING WITH FALLBACK
    // Priority 1: Try exact ward match (if ward provided)
    // Priority 2: If no results, try district match
    // Priority 3: If no results, try region match
    
    let result;
    let filterLevel = 'none';
    
    // Try Level 1: Exact ward match (most specific)
    if (region && district && area) {
      const wardConditions = [...whereConditions];
      const wardParams = [...queryParams];
      let wardParamIndex = paramIndex;
      
      wardConditions.push(`LOWER(s.region) = LOWER($${wardParamIndex})`);
      wardParams.push(region);
      wardParamIndex++;
      
      wardConditions.push(`LOWER(s.district) = LOWER($${wardParamIndex})`);
      wardParams.push(district);
      wardParamIndex++;
      
      wardConditions.push(`LOWER(s.area) LIKE LOWER($${wardParamIndex})`);
      wardParams.push(`${area}%`);
      wardParamIndex++;
      
      wardParams.push(limit);
      
      result = await pool.query(`
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
        WHERE ${wardConditions.join(' AND ')}
        ORDER BY s.created_at DESC
        LIMIT $${wardParamIndex}
      `, wardParams);
      
      if (result.rows.length > 0) {
        filterLevel = 'ward';
        console.log(`✅ Found ${result.rows.length} services at WARD level: ${region} > ${district} > ${area}`);
      }
    }
    
    // Try Level 2: District match (if no ward results)
    if ((!result || result.rows.length === 0) && region && district) {
      const districtConditions = [...whereConditions];
      const districtParams = [...queryParams];
      let districtParamIndex = paramIndex;
      
      districtConditions.push(`LOWER(s.region) = LOWER($${districtParamIndex})`);
      districtParams.push(region);
      districtParamIndex++;
      
      districtConditions.push(`LOWER(s.district) = LOWER($${districtParamIndex})`);
      districtParams.push(district);
      districtParamIndex++;
      
      districtParams.push(limit);
      
      result = await pool.query(`
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
        WHERE ${districtConditions.join(' AND ')}
        ORDER BY s.created_at DESC
        LIMIT $${districtParamIndex}
      `, districtParams);
      
      if (result.rows.length > 0) {
        filterLevel = 'district';
        console.log(`⚠️ No services in ward "${area}", showing ${result.rows.length} services from DISTRICT: ${region} > ${district}`);
      }
    }
    
    // Try Level 3: Region match (if no district results)
    if ((!result || result.rows.length === 0) && region) {
      const regionConditions = [...whereConditions];
      const regionParams = [...queryParams];
      let regionParamIndex = paramIndex;
      
      regionConditions.push(`LOWER(s.region) = LOWER($${regionParamIndex})`);
      regionParams.push(region);
      regionParamIndex++;
      
      regionParams.push(limit);
      
      result = await pool.query(`
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
        WHERE ${regionConditions.join(' AND ')}
        ORDER BY s.created_at DESC
        LIMIT $${regionParamIndex}
      `, regionParams);
      
      if (result.rows.length > 0) {
        filterLevel = 'region';
        console.log(`⚠️ No services in district "${district}", showing ${result.rows.length} services from REGION: ${region}`);
      }
    }
    
    // If still no results, return empty
    if (!result || result.rows.length === 0) {
      console.log(`❌ No services found for: ${region} > ${district} > ${area}`);
      return res.json({ 
        success: true, 
        services: [],
        count: 0,
        filterLevel: 'none',
        message: `No services available in ${area || district || region}`
      });
    }
    
    res.json({ 
      success: true, 
      services: result.rows,
      count: result.rows.length,
      filterLevel: filterLevel,
      message: filterLevel === 'ward' ? `Services in ${area}` :
               filterLevel === 'district' ? `No services in ${area}. Showing services from ${district} district` :
               filterLevel === 'region' ? `No services in ${district}. Showing services from ${region} region` :
               'Services found'
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to get services' });
  }
});

module.exports = router;
