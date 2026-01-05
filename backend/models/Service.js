const { pool } = require('../config/postgresql');

// Helper function to normalize location strings for consistent storage
const normalizeLocation = (str) => {
  if (!str) return null;
  const trimmed = str.trim();
  return trimmed === '' ? null : trimmed;
};

class Service {
  // Create a new service
  static async create(serviceData) {
    const {
      provider_id,
      title,
      description,
      category,
      subcategory,
      price,
      currency = 'TZS',
      duration,
      max_participants,
      location,
      country,
      region,
      district,
      area,
      images = [],
      amenities = [],
      is_active = true,
      is_featured = false,
      featured_until,
      featured_priority = 0,
      promotion_type,
      promotion_location,
      views_count = 0,
      bookings_count = 0,
      average_rating = 0.00,
      total_bookings = 0,
      payment_methods = {},
      contact_info = {}
    } = serviceData;

    const normalizedRegion = normalizeLocation(region);
    const normalizedDistrict = normalizeLocation(district);
    const normalizedArea = normalizeLocation(area);
    const normalizedLocation = normalizeLocation(location);
    const normalizedCountry = normalizeLocation(country) || 'Tanzania';

    console.log('📍 [SERVICE CREATE] Normalized location:', {
      region: normalizedRegion,
      district: normalizedDistrict,
      area: normalizedArea,
      location: normalizedLocation,
      country: normalizedCountry
    });

    const query = `
      INSERT INTO services (
        provider_id, title, description, category, subcategory, price, currency,
        duration, max_participants, location, country, region, district, area,
        images, amenities, is_active, is_featured, featured_until, featured_priority,
        promotion_type, promotion_location, views_count, bookings_count,
        average_rating, total_bookings, payment_methods, contact_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *
    `;

    const values = [
      provider_id,
      title?.trim(),
      description,
      category?.trim(),
      subcategory?.trim(),
      price,
      currency?.trim(),
      duration,
      max_participants,
      normalizedLocation,
      normalizedCountry,
      normalizedRegion,
      normalizedDistrict,
      normalizedArea,
      images,
      amenities,
      is_active,
      is_featured,
      featured_until,
      featured_priority,
      promotion_type,
      promotion_location,
      views_count,
      bookings_count,
      average_rating,
      total_bookings,
      payment_methods ? JSON.stringify(payment_methods) : '{}',
      contact_info ? JSON.stringify(contact_info) : '{}'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find service by ID
  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find service by ID with provider details
  static async findByIdWithProvider(id) {
    const query = `
      SELECT s.*, 
             sp.business_name, sp.business_type, sp.rating as provider_rating,
             sp.location as provider_location, sp.country as provider_country,
             sp.region as provider_region, sp.district as provider_district,
             sp.user_id as provider_user_id, sp.is_verified as provider_verified
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one service by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM services LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM services WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all services with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM services';
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Find services with provider details (populate equivalent)
  static async findWithProvider(conditions = {}) {
    let query = `
      SELECT s.*, 
             sp.business_name, sp.business_type, sp.rating as provider_rating,
             sp.location as provider_location, sp.country as provider_country,
             sp.region as provider_region, sp.district as provider_district,
             sp.user_id as provider_user_id, sp.is_verified as provider_verified
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `s.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY s.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update service by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE services
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete service by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM services WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count services
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM services';
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  // Search services
  static async search(searchTerm, filters = {}) {
    let query = `
      SELECT s.*, 
             sp.business_name, sp.business_type, sp.rating as provider_rating
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
    `;
    const values = [];
    let paramIndex = 1;

    if (searchTerm) {
      query += ` AND (s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`;
      values.push(`%${searchTerm}%`);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND s.category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters.region) {
      query += ` AND s.region = $${paramIndex}`;
      values.push(filters.region);
      paramIndex++;
    }

    if (filters.min_price) {
      query += ` AND s.price >= $${paramIndex}`;
      values.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price) {
      query += ` AND s.price <= $${paramIndex}`;
      values.push(filters.max_price);
      paramIndex++;
    }

    query += ' ORDER BY s.average_rating DESC, s.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get featured services
  static async getFeatured(limit = 10) {
    const query = `
      SELECT s.*, 
             sp.business_name, sp.business_type, sp.rating as provider_rating
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_featured = true 
        AND s.is_active = true
        AND (s.featured_until IS NULL OR s.featured_until > NOW())
      ORDER BY s.featured_priority DESC, s.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}

module.exports = Service;
