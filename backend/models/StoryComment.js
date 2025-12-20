const { pool } = require('../config/postgresql');

class StoryComment {
  // Create a new story comment
  static async create(commentData) {
    const { story_id, user_id, comment } = commentData;

    const query = `
      INSERT INTO story_comments (story_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [story_id, user_id, comment];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find comment by ID
  static async findById(id) {
    const query = 'SELECT * FROM story_comments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one comment by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM story_comments WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all comments with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM story_comments';
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

  // Find comments with user details
  static async findWithUser(conditions = {}) {
    let query = `
      SELECT sc.*, 
             u.first_name, u.last_name, u.avatar_url, u.email
      FROM story_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `sc.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY sc.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update comment by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE story_comments
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete comment by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM story_comments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count comments
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM story_comments';
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

module.exports = StoryComment;
