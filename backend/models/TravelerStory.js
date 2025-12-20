const { pool } = require('../config/postgresql');

class TravelerStory {
  // Create a new traveler story
  static async create(storyData) {
    const {
      user_id,
      title,
      story,
      location,
      duration,
      highlights = [],
      media = [],
      is_approved = false,
      is_active = false,  // Stories are not active until admin approves
      likes_count = 0,
      comments_count = 0
    } = storyData;

    const query = `
      INSERT INTO traveler_stories (
        user_id, title, story, location, duration, highlights, media,
        is_approved, is_active, likes_count, comments_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      user_id,
      title?.trim(),
      story,
      location?.trim(),
      duration?.trim(),
      highlights,
      JSON.stringify(media),
      is_approved,
      is_active,
      likes_count,
      comments_count
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find story by ID
  static async findById(id) {
    const query = 'SELECT * FROM traveler_stories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find story by ID with user details
  static async findByIdWithUser(id) {
    const query = `
      SELECT ts.*, 
             u.first_name, u.last_name, u.avatar_url, u.email
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ts.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one story by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM traveler_stories WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all stories with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM traveler_stories';
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

  // Find stories with user details
  static async findWithUser(conditions = {}) {
    let query = `
      SELECT ts.*, 
             u.first_name, u.last_name, u.avatar_url, u.email
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `ts.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY ts.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update story by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE traveler_stories
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete story by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM traveler_stories WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count stories
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM traveler_stories';
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

module.exports = TravelerStory;
