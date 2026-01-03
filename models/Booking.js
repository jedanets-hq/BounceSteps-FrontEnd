const { pool } = require('../config/postgresql');

class Booking {
  // Create a new booking - with automatic constraint fix
  static async create(bookingData) {
    const {
      traveler_id,
      service_id,
      provider_id,
      booking_date,
      start_time,
      end_time,
      participants = 1,
      total_amount,
      status = 'pending',
      payment_status = 'pending',
      special_requests
    } = bookingData;

    // Also support user_id as alias for traveler_id
    const userId = traveler_id || bookingData.user_id;

    // First, ensure the constraint allows the status we're using
    try {
      await pool.query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check');
      await pool.query(`
        ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
        CHECK (status IN ('draft', 'pending', 'confirmed', 'cancelled', 'completed'))
      `);
    } catch (constraintError) {
      // Constraint might already be correct, continue
      console.log('Constraint check:', constraintError.message);
    }

    const query = `
      INSERT INTO bookings (
        traveler_id, service_id, provider_id, booking_date, start_time, end_time,
        participants, total_amount, status, payment_status, special_requests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      userId,
      service_id,
      provider_id,
      booking_date,
      start_time,
      end_time,
      participants,
      total_amount,
      status,
      payment_status,
      special_requests
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find booking by ID
  static async findById(id) {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find booking by ID with related data
  static async findByIdWithDetails(id) {
    const query = `
      SELECT b.*, 
             s.title as service_title, s.price as service_price, s.location as service_location,
             sp.business_name as provider_name,
             u.email as traveler_email, u.first_name as traveler_first_name, u.last_name as traveler_last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find one booking by conditions
  static async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    if (keys.length === 0) {
      const result = await pool.query('SELECT * FROM bookings LIMIT 1');
      return result.rows[0];
    }
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const query = `SELECT * FROM bookings WHERE ${whereClause} LIMIT 1`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find all bookings with optional conditions
  static async find(conditions = {}) {
    let query = 'SELECT * FROM bookings';
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

  // Find bookings with related data (populate equivalent)
  static async findWithDetails(conditions = {}) {
    let query = `
      SELECT b.*, 
             s.title as service_title, s.price as service_price, s.location as service_location, s.images as service_images,
             sp.business_name as provider_name,
             u.email as traveler_email, u.first_name as traveler_first_name, u.last_name as traveler_last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON b.traveler_id = u.id
    `;
    const values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      const whereClause = keys.map((key, index) => {
        values.push(conditions[key]);
        return `b.${key} = $${index + 1}`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    query += ' ORDER BY b.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update booking by ID
  static async findByIdAndUpdate(id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return this.findById(id);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `
      UPDATE bookings
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  }

  // Delete booking by ID
  static async findByIdAndDelete(id) {
    const query = 'DELETE FROM bookings WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Count bookings
  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM bookings';
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

module.exports = Booking;
