const { pool } = require('../config/postgresql');

class Payment {
  // Create a new payment
  static async create(paymentData) {
    const {
      user_id,
      provider_id,
      service_id,
      booking_id,
      payment_type,
      amount,
      currency = 'TZS',
      payment_method,
      payment_status = 'pending',
      transaction_id,
      description,
      valid_from,
      valid_until
    } = paymentData;

    const query = `
      INSERT INTO payments (
        user_id, provider_id, service_id, booking_id, payment_type, amount, currency,
        payment_method, payment_status, transaction_id, description,
        valid_from, valid_until
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      user_id,
      provider_id,
      service_id,
      booking_id,
      payment_type,
      amount,
      currency,
      payment_method,
      payment_status,
      transaction_id,
      description,
      valid_from,
      valid_until
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find payment by ID
  static async findById(id) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find payment by transaction ID
  static async findByTransactionId(transactionId) {
    const query = 'SELECT * FROM payments WHERE transaction_id = $1';
    const result = await pool.query(query, [transactionId]);
    return result.rows[0];
  }

  // Find one payment by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM payments LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM payments WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all payments with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM payments';
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

  // Find payments with user details
  static async findWithUser(conditions = {}) {
    let query = `
      SELECT p.*, 
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `p.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update payment by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE payments
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete payment by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM payments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count payments
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM payments';
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

module.exports = Payment;
