const { pool } = require('../config/postgresql');

class User {
  // Create a new user
  static async create(userData) {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      user_type,
      google_id,
      avatar_url,
      is_verified = false,
      is_active = true,
      auth_provider = null // Will be auto-determined if not provided
    } = userData;

    // Auto-determine auth_provider based on credentials
    let finalAuthProvider = auth_provider;
    if (!finalAuthProvider) {
      if (google_id && password) {
        finalAuthProvider = 'both';
      } else if (google_id) {
        finalAuthProvider = 'google';
      } else {
        finalAuthProvider = 'email';
      }
    }

    const query = `
      INSERT INTO users (
        email, password, first_name, last_name, phone, user_type,
        google_id, avatar_url, is_verified, is_active, auth_provider
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      email?.toLowerCase()?.trim(),
      password,
      first_name?.trim(),
      last_name?.trim(),
      phone?.trim(),
      user_type,
      google_id,
      avatar_url,
      is_verified,
      is_active,
      finalAuthProvider
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email?.toLowerCase()?.trim()]);
    return result.rows[0];
  }

  // Find user by Google ID
  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  }

  // Find one user by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM users LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM users WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all users with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM users';
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

  // Update user by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete user by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count users
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM users';
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

  // Update user (generic method for passport compatibility)
  static async update(id, updateData) {
    return this.findByIdAndUpdate(id, updateData);
  }
}

module.exports = User;
