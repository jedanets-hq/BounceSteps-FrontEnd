const { pool } = require('../config/postgresql');

class ServiceProvider {
  // Create a new service provider
  static async create(providerData) {
    const {
      user_id,
      business_name,
      business_type,
      description,
      location,
      service_location,
      country,
      region,
      district,
      area,
      ward,
      location_data,
      service_categories = [],
      license_number,
      rating = 0.00,
      total_bookings = 0,
      is_verified = false
    } = providerData;

    const query = `
      INSERT INTO service_providers (
        user_id, business_name, business_type, description, location, service_location,
        country, region, district, area, ward, location_data, service_categories,
        license_number, rating, total_bookings, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      user_id,
      business_name?.trim(),
      business_type?.trim(),
      description,
      location?.trim(),
      service_location?.trim(),
      country?.trim(),
      region?.trim(),
      district?.trim(),
      area?.trim(),
      ward?.trim(),
      location_data ? JSON.stringify(location_data) : null,
      service_categories,
      license_number?.trim(),
      rating,
      total_bookings,
      is_verified
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find service provider by ID
  static async findById(id) {
    const query = 'SELECT * FROM service_providers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find service provider by user ID
  static async findByUserId(userId) {
    const query = 'SELECT * FROM service_providers WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Find one service provider by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM service_providers LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM service_providers WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all service providers with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM service_providers';
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

  // Find service providers with user details (populate equivalent)
  static async findWithUser(conditions = {}) {
    let query = `
      SELECT sp.*, 
             u.email, u.first_name, u.last_name, u.phone, u.avatar_url
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `sp.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY sp.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update service provider by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE service_providers
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Update service provider by user ID
  static async findOneAndUpdate(conditions, updateData) {
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const updateKeys = Object.keys(updateData);
    const updateValues = Object.values(updateData);

    const whereClause = conditionKeys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const setClause = updateKeys.map((key, index) => `${key} = $${conditionValues.length + index + 1}`).join(', ');
    
    const query = `
      UPDATE service_providers
      SET ${setClause}, updated_at = NOW()
      WHERE ${whereClause}
      RETURNING *
    `;

    const result = await pool.query(query, [...conditionValues, ...updateValues]);
    return result.rows[0];
  }

  // Delete service provider by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM service_providers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count service providers
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM service_providers';
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
}

module.exports = ServiceProvider;
