const { pool } = require('../config/postgresql');

class Review {
  // Create a new review
  static async create(reviewData) {
    const {
      booking_id,
      traveler_id,
      service_id,
      provider_id,
      rating,
      comment
    } = reviewData;

    const query = `
      INSERT INTO reviews (
        booking_id, traveler_id, service_id, provider_id, rating, comment
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      booking_id,
      traveler_id,
      service_id,
      provider_id,
      rating,
      comment
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find review by ID
  static async findById(id) {
    const query = 'SELECT * FROM reviews WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one review by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM reviews LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM reviews WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all reviews with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM reviews';
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

  // Find reviews with traveler details
  static async findWithTraveler(conditions = {}) {
    let query = `
      SELECT r.*, 
             u.first_name as traveler_first_name, u.last_name as traveler_last_name, u.avatar_url as traveler_avatar
      FROM reviews r
      LEFT JOIN users u ON r.traveler_id = u.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `r.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update review by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE reviews
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete review by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count reviews
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM reviews';
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

  // Calculate average rating for a service
  static async getAverageRating(serviceId) {
    const query = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE service_id = $1
    `;
    const result = await pool.query(query, [serviceId]);
    return result.rows[0];
  }
}

module.exports = Review;
