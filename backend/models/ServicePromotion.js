const { pool } = require('../config/postgresql');

class ServicePromotion {
  // Create a new service promotion
  static async create(promotionData) {
    const {
      service_id,
      promotion_type,
      promotion_location,
      duration_days,
      cost,
      payment_method,
      payment_reference,
      started_at,
      expires_at
    } = promotionData;

    const query = `
      INSERT INTO service_promotions (
        service_id, promotion_type, promotion_location, duration_days, cost,
        payment_method, payment_reference, started_at, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      service_id,
      promotion_type,
      promotion_location,
      duration_days,
      cost,
      payment_method,
      payment_reference,
      started_at,
      expires_at
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find promotion by ID
  static async findById(id) {
    const query = 'SELECT * FROM service_promotions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one promotion by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM service_promotions WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all promotions with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM service_promotions';
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

  // Find promotions with service details
  static async findWithService(conditions = {}) {
    let query = `
      SELECT sp.*, 
             s.title as service_title, s.category as service_category
      FROM service_promotions sp
      LEFT JOIN services s ON sp.service_id = s.id
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

  // Update promotion by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE service_promotions
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete promotion by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM service_promotions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count promotions
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM service_promotions';
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

  // Get active promotions
  static async getActive() {
    const query = `
      SELECT sp.*, 
             s.title as service_title, s.category as service_category
      FROM service_promotions sp
      LEFT JOIN services s ON sp.service_id = s.id
      WHERE sp.expires_at > NOW()
      ORDER BY sp.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = ServicePromotion;
