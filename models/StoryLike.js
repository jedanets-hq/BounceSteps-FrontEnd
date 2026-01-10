const { pool } = require('../config/postgresql');

class StoryLike {
  // Create a new story like
  static async create(likeData) {
    const { story_id, user_id } = likeData;

    const query = `
      INSERT INTO story_likes (story_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [story_id, user_id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('User has already liked this story');
      }
      throw error;
    }
  }

  // Find like by ID
  static async findById(id) {
    const query = 'SELECT * FROM story_likes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one like by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM story_likes LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM story_likes WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all likes with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM story_likes';
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

  // Delete like by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM story_likes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Delete like by story and user
  static async deleteOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      return null;
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `DELETE FROM story_likes WHERE ${whereClause} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Count likes
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM story_likes';
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

module.exports = StoryLike;
