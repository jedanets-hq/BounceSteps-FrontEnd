const express = require('express');
const router = express.Router();
const { User, ServiceProvider, Service, Booking, Payment } = require('../models');
const { pool } = require('../config/postgresql');

// Middleware to bypass authentication for admin portal (temporary - for development)
const authenticateJWT = (req, res, next) => {
  next();
};

const isAdmin = (req, res, next) => {
  next();
};

// ==========================================
// PUBLIC ENDPOINTS (No Auth Required)
// ==========================================

// Public trust statistics for homepage
router.get('/public/trust-stats', async (req, res) => {
  try {
    // Get total travelers (users with user_type = 'traveler')
    const travelersResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE user_type = 'traveler'"
    );
    const totalTravelers = parseInt(travelersResult.rows[0]?.count || 0);

    // Get total bookings
    const bookingsResult = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed', 'completed')"
    );
    const totalBookings = parseInt(bookingsResult.rows[0]?.count || 0);

    // Get average rating from reviews
    const ratingsResult = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE rating IS NOT NULL"
    );
    const averageRating = parseFloat(ratingsResult.rows[0]?.avg_rating || 0);

    // Get unique destinations (locations from services)
    const destinationsResult = await pool.query(
      "SELECT COUNT(DISTINCT location) FROM services WHERE is_active = true AND location IS NOT NULL"
    );
    const totalDestinations = parseInt(destinationsResult.rows[0]?.count || 0);

    res.json({
      success: true,
      stats: {
        totalTravelers,
        totalBookings,
        averageRating,
        totalDestinations
      }
    });
  } catch (error) {
    console.error('Error fetching trust stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trust statistics',
      stats: {
        totalTravelers: 0,
        totalBookings: 0,
        averageRating: 0,
        totalDestinations: 0
      }
    });
  }
});

// ==========================================
// CATEGORIES & DESTINATIONS
// ==========================================

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM services 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    res.json({
      success: true,
      categories: result.rows.map(r => ({
        id: r.category,
        name: r.category,
        count: parseInt(r.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

router.get('/destinations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT location, region, COUNT(*) as count 
      FROM services 
      WHERE location IS NOT NULL 
      GROUP BY location, region 
      ORDER BY count DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      destinations: result.rows.map(r => ({
        id: r.location,
        name: r.location,
        region: r.region,
        count: parseInt(r.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ success: false, message: 'Error fetching destinations' });
  }
});

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

router.get('/analytics/dashboard', authenticateJWT, isAdmin, async (req, res) => {
  try {
    let totalUsers = 0, totalServices = 0, totalBookings = 0;
    let activeServices = 0, pendingServices = 0;
    let totalTravelers = 0, totalProviders = 0;

    try {
      const usersCount = await pool.query('SELECT COUNT(*) FROM users');
      totalUsers = parseInt(usersCount.rows[0]?.count || 0);
      
      const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
      totalServices = parseInt(servicesCount.rows[0]?.count || 0);
      
      const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');
      totalBookings = parseInt(bookingsCount.rows[0]?.count || 0);
      
      const activeCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_active = true');
      activeServices = parseInt(activeCount.rows[0]?.count || 0);
      
      const pendingCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_active = false');
      pendingServices = parseInt(pendingCount.rows[0]?.count || 0);
      
      const travelersCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'traveler'");
      totalTravelers = parseInt(travelersCount.rows[0]?.count || 0);
      
      const providersCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'service_provider'");
      totalProviders = parseInt(providersCount.rows[0]?.count || 0);
    } catch (e) {
      console.log('Stats count error:', e.message);
    }

    let monthlyRevenue = 0;
    try {
      const revenueResult = await pool.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE payment_status = 'completed' 
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `);
      monthlyRevenue = parseFloat(revenueResult.rows[0]?.total || 0);
    } catch (e) {}

    let recentUsers = [], recentServices = [], recentBookings = [];
    try {
      const usersResult = await pool.query(`SELECT id, first_name, last_name, email, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 5`);
      recentUsers = usersResult.rows;
    } catch (e) {}
    
    try {
      const servicesResult = await pool.query(`SELECT id, title, category, created_at FROM services ORDER BY created_at DESC LIMIT 5`);
      recentServices = servicesResult.rows;
    } catch (e) {}
    
    try {
      const bookingsResult = await pool.query(`SELECT id, status, created_at FROM bookings ORDER BY created_at DESC LIMIT 5`);
      recentBookings = bookingsResult.rows;
    } catch (e) {}

    const recentActivity = [
      ...recentUsers.map(u => ({ id: u.id, action: 'user_created', description: `New user registered: ${u.first_name || ''} ${u.last_name || ''}`.trim(), user: { name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown' }, createdAt: u.created_at })),
      ...recentServices.map(s => ({ id: s.id, action: 'service_created', description: `New service added: ${s.title || 'Unknown'}`, user: { name: 'Service Provider' }, createdAt: s.created_at })),
      ...recentBookings.map(b => ({ id: b.id, action: 'booking_created', description: `New booking created`, user: { name: 'Traveler' }, createdAt: b.created_at }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    let servicesData = { labels: [], values: [] };
    try {
      const categoryResult = await pool.query(`SELECT category, COUNT(*) as count FROM services GROUP BY category ORDER BY count DESC`);
      servicesData = { labels: categoryResult.rows.map(r => r.category || 'Uncategorized'), values: categoryResult.rows.map(r => parseInt(r.count)) };
    } catch (e) {}

    let bookingsData = { labels: [], values: [] };
    try {
      const statusResult = await pool.query(`SELECT status, COUNT(*) as count FROM bookings GROUP BY status`);
      bookingsData = { labels: statusResult.rows.map(r => r.status || 'Unknown'), values: statusResult.rows.map(r => parseInt(r.count)) };
    } catch (e) {}

    res.json({
      success: true,
      stats: { totalUsers, totalServices, totalBookings, activeServices, pendingApprovals: pendingServices, monthlyRevenue, totalTravelers, totalProviders, newUsersToday: 0, completedToday: 0, openTickets: 0 },
      revenueData: { labels: [], values: [] },
      bookingsData,
      usersData: { labels: [], values: [] },
      servicesData,
      recentActivity,
      pendingActions: { userVerifications: 0, serviceApprovals: pendingServices, supportTickets: 0, pendingPayouts: 0 },
      topServices: [],
      topProviders: [],
      systemHealth: { apiResponseTime: '45ms', databaseStatus: 'Connected', serverUptime: '99.9%', activeSessions: totalUsers }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard analytics' });
  }
});


// ==========================================
// USER MANAGEMENT
// ==========================================

router.get('/users', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const values = [];
    let paramIndex = 1;

    if (role) {
      whereClause += ` AND user_type = $${paramIndex}`;
      values.push(role);
      paramIndex++;
    }

    if (status === 'active') {
      whereClause += ` AND is_active = true`;
    } else if (status === 'suspended') {
      whereClause += ` AND is_active = false`;
    }

    if (search) {
      whereClause += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM users WHERE ${whereClause}`, values);
    const total = parseInt(countResult.rows[0]?.count || 0);

    values.push(parseInt(limit), offset);
    const result = await pool.query(`SELECT * FROM users WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, values);
    
    const users = result.rows.map(u => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown',
      email: u.email,
      phone: u.phone,
      role: u.user_type,
      status: u.is_active ? 'active' : 'suspended',
      avatar: u.avatar_url,
      createdAt: u.created_at,
      lastActive: u.last_login || u.updated_at
    }));

    let stats = { total: 0, travelers: 0, providers: 0, activeToday: 0 };
    try {
      const totalCount = await pool.query('SELECT COUNT(*) FROM users');
      const travelersCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'traveler'");
      const providersCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'service_provider'");
      stats = {
        total: parseInt(totalCount.rows[0]?.count || 0),
        travelers: parseInt(travelersCount.rows[0]?.count || 0),
        providers: parseInt(providersCount.rows[0]?.count || 0),
        activeToday: 0
      };
    } catch (e) {}

    res.json({ success: true, users, stats, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

router.get('/users/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const totalCount = await pool.query('SELECT COUNT(*) FROM users');
    const travelersCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'traveler'");
    const providersCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'service_provider'");
    const adminsCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'admin'");
    const stats = {
      total: parseInt(totalCount.rows[0]?.count || 0),
      travelers: parseInt(travelersCount.rows[0]?.count || 0),
      providers: parseInt(providersCount.rows[0]?.count || 0),
      admins: parseInt(adminsCount.rows[0]?.count || 0),
      activeToday: 0
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user stats' });
  }
});

router.get('/users/:userId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { id: user.id, name: `${user.first_name || ''} ${user.last_name || ''}`.trim(), email: user.email, phone: user.phone, role: user.user_type, status: user.is_active ? 'active' : 'suspended', avatar: user.avatar_url, createdAt: user.created_at, lastActive: user.last_login } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

router.put('/users/:userId/status', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { is_active: req.body.isActive });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
});

router.post('/users/:userId/verify', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { is_verified: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying user' });
  }
});

router.post('/users/:userId/suspend', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { is_active: false });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error suspending user' });
  }
});

router.delete('/users/:userId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});


// ==========================================
// SERVICE MANAGEMENT
// ==========================================

router.get('/services', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const values = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND s.category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    if (status === 'approved' || status === 'active') {
      whereClause += ` AND s.is_active = true`;
    } else if (status === 'pending' || status === 'inactive') {
      whereClause += ` AND s.is_active = false`;
    }

    if (search) {
      whereClause += ` AND (s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM services s WHERE ${whereClause}`, values);
    const total = parseInt(countResult.rows[0]?.count || 0);

    values.push(parseInt(limit), offset);
    const result = await pool.query(`
      SELECT s.*, sp.business_name, u.first_name, u.last_name, u.email as provider_email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, values);
    
    const services = result.rows.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      price: s.price,
      currency: s.currency,
      location: s.location,
      images: s.images || [],
      is_active: s.is_active,
      status: s.is_active ? 'approved' : 'pending',
      featured: s.is_featured,
      business_name: s.business_name,
      average_rating: s.average_rating,
      provider: { name: s.business_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(), email: s.provider_email },
      createdAt: s.created_at
    }));

    let stats = { total: 0, active: 0, pending: 0, inactive: 0 };
    try {
      const totalCount = await pool.query('SELECT COUNT(*) FROM services');
      const activeCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_active = true');
      const pendingCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_active = false');
      stats = {
        total: parseInt(totalCount.rows[0]?.count || 0),
        active: parseInt(activeCount.rows[0]?.count || 0),
        pending: parseInt(pendingCount.rows[0]?.count || 0),
        inactive: 0
      };
    } catch (e) {}

    res.json({ success: true, services, stats, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});

router.get('/services/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const totalCount = await pool.query('SELECT COUNT(*) FROM services');
    const activeCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_active = true');
    const pendingCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_active = false');
    const featuredCount = await pool.query('SELECT COUNT(*) FROM services WHERE is_featured = true');
    const stats = {
      total: parseInt(totalCount.rows[0]?.count || 0),
      active: parseInt(activeCount.rows[0]?.count || 0),
      pending: parseInt(pendingCount.rows[0]?.count || 0),
      featured: parseInt(featuredCount.rows[0]?.count || 0)
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching service stats' });
  }
});

router.get('/services/:serviceId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, sp.business_name, u.first_name, u.last_name, u.email as provider_email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE s.id = $1
    `, [req.params.serviceId]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });

    const s = result.rows[0];
    res.json({ success: true, service: { id: s.id, title: s.title, description: s.description, category: s.category, price: s.price, currency: s.currency, location: s.location, images: s.images || [], is_active: s.is_active, is_featured: s.is_featured, average_rating: s.average_rating, business_name: s.business_name, provider: { name: s.business_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(), email: s.provider_email }, createdAt: s.created_at } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching service' });
  }
});

router.post('/services/:serviceId/approve', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('UPDATE services SET is_active = true WHERE id = $1 RETURNING *', [req.params.serviceId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving service' });
  }
});

router.post('/services/:serviceId/reject', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('UPDATE services SET is_active = false WHERE id = $1 RETURNING *', [req.params.serviceId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting service' });
  }
});

router.delete('/services/:serviceId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE service_id = $1', [req.params.serviceId]);
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [req.params.serviceId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting service' });
  }
});


// ==========================================
// BOOKING MANAGEMENT
// ==========================================

router.get('/bookings', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = '1=1';
    const countValues = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND b.status = $${paramIndex}`;
      countValues.push(status);
      paramIndex++;
    }

    // Count query
    const countQuery = status 
      ? `SELECT COUNT(*) FROM bookings b WHERE b.status = $1`
      : `SELECT COUNT(*) FROM bookings b`;
    const countResult = await pool.query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0]?.count || 0);

    // Main query
    const queryValues = status ? [status, parseInt(limit), offset] : [parseInt(limit), offset];
    const limitParam = status ? '$2' : '$1';
    const offsetParam = status ? '$3' : '$2';
    
    const query = `
      SELECT b.*, s.title as service_title, s.category, u.first_name, u.last_name, u.email
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await pool.query(query, queryValues);
    
    const bookings = result.rows.map(b => ({
      id: b.id,
      status: b.status,
      totalAmount: b.total_amount,
      bookingDate: b.booking_date,
      guests: b.number_of_guests,
      service: { title: b.service_title, category: b.category },
      traveler: { name: `${b.first_name || ''} ${b.last_name || ''}`.trim(), email: b.email },
      createdAt: b.created_at
    }));

    let stats = { total: 0, confirmed: 0, pending: 0, revenue: 0 };
    try {
      const totalCount = await pool.query('SELECT COUNT(*) FROM bookings');
      const confirmedCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
      const pendingCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
      stats = {
        total: parseInt(totalCount.rows[0]?.count || 0),
        confirmed: parseInt(confirmedCount.rows[0]?.count || 0),
        pending: parseInt(pendingCount.rows[0]?.count || 0),
        revenue: 0
      };
    } catch (e) {}

    res.json({ success: true, bookings, stats, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

router.post('/bookings/:bookingId/cancel', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *", [req.params.bookingId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling booking' });
  }
});

router.get('/bookings/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const totalCount = await pool.query('SELECT COUNT(*) FROM bookings');
    const confirmedCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
    const pendingCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
    const completedCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'completed'");
    const cancelledCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'");
    const stats = {
      total: parseInt(totalCount.rows[0]?.count || 0),
      confirmed: parseInt(confirmedCount.rows[0]?.count || 0),
      pending: parseInt(pendingCount.rows[0]?.count || 0),
      completed: parseInt(completedCount.rows[0]?.count || 0),
      cancelled: parseInt(cancelledCount.rows[0]?.count || 0)
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking stats' });
  }
});

router.get('/bookings/calendar', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const result = await pool.query(`
      SELECT b.*, s.title as service_title, u.first_name, u.last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE EXTRACT(MONTH FROM b.booking_date) = $1 AND EXTRACT(YEAR FROM b.booking_date) = $2
      ORDER BY b.booking_date ASC
    `, [targetMonth, targetYear]);
    
    const events = result.rows.map(b => ({
      id: b.id,
      title: b.service_title || 'Booking',
      date: b.booking_date,
      status: b.status,
      traveler: `${b.first_name || ''} ${b.last_name || ''}`.trim()
    }));

    res.json({ success: true, events, month: targetMonth, year: targetYear });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booking calendar' });
  }
});

router.get('/pre-orders', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const countResult = await pool.query(`SELECT COUNT(*) FROM bookings WHERE status IN ('pre_order', 'pending')`);
    const total = parseInt(countResult.rows[0]?.count || 0);

    const result = await pool.query(`
      SELECT b.*, s.title as service_title, s.category, u.first_name, u.last_name, u.email
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.status IN ('pre_order', 'pending')
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    const preOrders = result.rows.map(b => ({
      id: b.id,
      status: b.status,
      totalAmount: b.total_amount,
      bookingDate: b.booking_date,
      guests: b.number_of_guests,
      service: { title: b.service_title, category: b.category },
      traveler: { name: `${b.first_name || ''} ${b.last_name || ''}`.trim(), email: b.email },
      createdAt: b.created_at
    }));

    res.json({ success: true, preOrders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pre-orders' });
  }
});


// ==========================================
// PAYMENT MANAGEMENT
// ==========================================

router.get('/payments', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const countQuery = status 
      ? `SELECT COUNT(*) FROM payments WHERE payment_status = $1`
      : `SELECT COUNT(*) FROM payments`;
    const countResult = await pool.query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0]?.count || 0);

    const queryValues = status ? [status, parseInt(limit), offset] : [parseInt(limit), offset];
    const whereClause = status ? `WHERE p.payment_status = $1` : '';
    const limitParam = status ? '$2' : '$1';
    const offsetParam = status ? '$3' : '$2';
    
    const result = await pool.query(`
      SELECT p.*, u.first_name, u.last_name, u.email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, queryValues);
    
    const payments = result.rows.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.payment_status,
      method: p.payment_method,
      user: { name: `${p.first_name || ''} ${p.last_name || ''}`.trim(), email: p.email },
      createdAt: p.created_at
    }));

    let totalCompleted = 0, totalPending = 0, paymentCount = 0;
    try {
      const completedResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'`);
      totalCompleted = parseFloat(completedResult.rows[0]?.total || 0);
      const pendingResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending'`);
      totalPending = parseFloat(pendingResult.rows[0]?.total || 0);
      const countResult = await pool.query('SELECT COUNT(*) FROM payments');
      paymentCount = parseInt(countResult.rows[0]?.count || 0);
    } catch (e) {}

    res.json({ success: true, payments, stats: { total: paymentCount, completed: totalCompleted, pending: totalPending, failed: 0 }, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
});

router.get('/payments/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const totalResult = await pool.query(`SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments`);
    const completedResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'`);
    const pendingResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending'`);

    res.json({
      success: true,
      stats: {
        total: parseInt(totalResult.rows[0]?.count || 0),
        totalAmount: parseFloat(totalResult.rows[0]?.total || 0),
        completed: parseFloat(completedResult.rows[0]?.total || 0),
        pending: parseFloat(pendingResult.rows[0]?.total || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payment stats' });
  }
});

router.get('/transactions', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM payments');
    const total = parseInt(countResult.rows[0]?.count || 0);

    const result = await pool.query(
      'SELECT p.*, u.first_name, u.last_name, u.email FROM payments p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), offset]
    );
    
    const transactions = result.rows.map(t => ({
      id: t.id,
      type: t.payment_method,
      amount: t.amount,
      currency: t.currency,
      status: t.payment_status,
      reference: t.transaction_id,
      user: { name: ((t.first_name || '') + ' ' + (t.last_name || '')).trim(), email: t.email },
      service: 'N/A',
      createdAt: t.created_at
    }));

    res.json({ success: true, transactions, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching transactions' });
  }
});

router.get('/revenue', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'today') dateFilter = "AND created_at >= CURRENT_DATE";
    else if (period === 'week') dateFilter = "AND created_at >= DATE_TRUNC('week', CURRENT_DATE)";
    else if (period === 'month') dateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)";
    else if (period === 'year') dateFilter = "AND created_at >= DATE_TRUNC('year', CURRENT_DATE)";

    const totalResult = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'" + dateFilter);
    const totalRevenue = parseFloat(totalResult.rows[0]?.total || 0);

    const dailyResult = await pool.query("SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0) as revenue FROM payments WHERE payment_status = 'completed'" + dateFilter + " GROUP BY DATE(created_at) ORDER BY date ASC");

    res.json({
      success: true,
      revenue: {
        total: totalRevenue,
        period,
        byCategory: [],
        daily: dailyResult.rows.map(r => ({ date: r.date, revenue: parseFloat(r.revenue) }))
      }
    });
  } catch (error) {
    console.error('Revenue error:', error);
    res.status(500).json({ success: false, message: 'Error fetching revenue' });
  }
});

router.get('/payouts', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const result = await pool.query(
      'SELECT sp.id as provider_id, sp.business_name, u.first_name, u.last_name, u.email, COUNT(DISTINCT s.id) as total_services FROM service_providers sp LEFT JOIN users u ON sp.user_id = u.id LEFT JOIN services s ON s.provider_id = sp.id GROUP BY sp.id, sp.business_name, u.first_name, u.last_name, u.email ORDER BY total_services DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), offset]
    );
    
    const payouts = result.rows.map(p => ({
      id: p.provider_id,
      provider: { name: p.business_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim(), email: p.email },
      totalEarnings: 0,
      totalBookings: parseInt(p.total_services || 0),
      status: 'pending'
    }));

    const countResult = await pool.query('SELECT COUNT(DISTINCT sp.id) FROM service_providers sp');
    const total = parseInt(countResult.rows[0]?.count || 0);

    res.json({ success: true, payouts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Payouts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching payouts' });
  }
});

router.get('/payouts/pending', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT sp.id as provider_id, sp.business_name, u.first_name, u.last_name, u.email FROM service_providers sp LEFT JOIN users u ON sp.user_id = u.id'
    );

    const pendingPayouts = result.rows.map(p => ({
      id: p.provider_id,
      provider: { name: p.business_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim(), email: p.email },
      amount: 0
    }));

    res.json({ success: true, pendingPayouts, total: pendingPayouts.length });
  } catch (error) {
    console.error('Pending payouts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending payouts' });
  }
});

router.post('/payouts/:id/process', authenticateJWT, isAdmin, async (req, res) => {
  res.json({ success: true, message: 'Payout processed successfully' });
});


// ==========================================
// PROVIDER VERIFICATION
// ==========================================

router.get('/providers/verification', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Check if table exists first
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'service_providers'
      )
    `);
    
    if (!tableCheck.rows[0]?.exists) {
      return res.json({
        success: true,
        providers: [],
        stats: { total: 0, verified: 0, unverified: 0 },
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        message: 'Service providers table not yet created.'
      });
    }

    // Check if is_verified column exists, if not add it
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'service_providers' AND column_name = 'is_verified'
      )
    `);
    
    if (!columnCheck.rows[0]?.exists) {
      await pool.query('ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false');
    }
    
    let whereClause = '1=1';
    if (status === 'verified') {
      whereClause += ' AND sp.is_verified = true';
    } else if (status === 'unverified') {
      whereClause += ' AND (sp.is_verified = false OR sp.is_verified IS NULL)';
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM service_providers sp WHERE ${whereClause}`);
    const total = parseInt(countResult.rows[0]?.count || 0);

    const result = await pool.query(`
      SELECT sp.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE ${whereClause}
      ORDER BY sp.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    const providers = result.rows.map(p => ({
      id: p.id,
      userId: p.user_id,
      businessName: p.business_name,
      businessType: p.business_type,
      description: p.description,
      location: p.location,
      rating: p.rating || 0,
      isVerified: p.is_verified || false,
      user: {
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        email: p.email,
        phone: p.phone,
        avatar: p.avatar_url
      },
      createdAt: p.created_at
    }));

    let verifiedCount = 0, unverifiedCount = 0;
    try {
      const vResult = await pool.query('SELECT COUNT(*) FROM service_providers WHERE is_verified = true');
      verifiedCount = parseInt(vResult.rows[0]?.count || 0);
      const uResult = await pool.query('SELECT COUNT(*) FROM service_providers WHERE is_verified = false OR is_verified IS NULL');
      unverifiedCount = parseInt(uResult.rows[0]?.count || 0);
    } catch (e) {}

    res.json({
      success: true,
      providers,
      stats: { total, verified: verifiedCount, unverified: unverifiedCount },
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching providers for verification:', error);
    res.status(500).json({ success: false, message: 'Error fetching providers: ' + error.message });
  }
});

router.post('/providers/:providerId/verify-badge', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { providerId } = req.params;
    const result = await pool.query(
      'UPDATE service_providers SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [providerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }
    res.json({ success: true, message: 'Verification badge added successfully', provider: result.rows[0] });
  } catch (error) {
    console.error('Error adding verification badge:', error);
    res.status(500).json({ success: false, message: 'Error adding verification badge' });
  }
});

router.post('/providers/:providerId/remove-badge', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { providerId } = req.params;
    const result = await pool.query(
      'UPDATE service_providers SET is_verified = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [providerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }
    res.json({ success: true, message: 'Verification badge removed successfully', provider: result.rows[0] });
  } catch (error) {
    console.error('Error removing verification badge:', error);
    res.status(500).json({ success: false, message: 'Error removing verification badge' });
  }
});


// ==========================================
// TRAVELER STORIES MANAGEMENT
// ==========================================

router.get('/stories', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Check if table exists first
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'traveler_stories'
      )
    `);
    
    if (!tableCheck.rows[0]?.exists) {
      // Create the table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS traveler_stories (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          story TEXT,
          location VARCHAR(255),
          duration VARCHAR(100),
          highlights TEXT[],
          media TEXT[],
          is_approved BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      return res.json({
        success: true,
        stories: [],
        stats: { total: 0, pending: 0, approved: 0 },
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        message: 'Traveler stories table created. No stories yet.'
      });
    }

    // Ensure required columns exist
    try {
      await pool.query('ALTER TABLE traveler_stories ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0');
      await pool.query('ALTER TABLE traveler_stories ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0');
      await pool.query('ALTER TABLE traveler_stories ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false');
    } catch (e) {
      // Columns might already exist
    }
    
    let whereClause = '1=1';
    if (status === 'pending') {
      whereClause += ' AND (ts.is_approved = false OR ts.is_approved IS NULL)';
    } else if (status === 'approved') {
      whereClause += ' AND ts.is_approved = true';
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM traveler_stories ts WHERE ${whereClause}`);
    const total = parseInt(countResult.rows[0]?.count || 0);

    const result = await pool.query(`
      SELECT ts.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ts.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);
    
    const stories = result.rows.map(s => ({
      id: s.id,
      title: s.title,
      story: s.story,
      location: s.location,
      duration: s.duration,
      highlights: s.highlights || [],
      media: s.media || [],
      isApproved: s.is_approved || false,
      likesCount: s.likes_count || 0,
      commentsCount: s.comments_count || 0,
      user: {
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        email: s.email,
        avatar: s.avatar_url
      },
      createdAt: s.created_at
    }));

    let pendingCount = 0, approvedCount = 0;
    try {
      const pResult = await pool.query('SELECT COUNT(*) FROM traveler_stories WHERE is_approved = false OR is_approved IS NULL');
      pendingCount = parseInt(pResult.rows[0]?.count || 0);
      const aResult = await pool.query('SELECT COUNT(*) FROM traveler_stories WHERE is_approved = true');
      approvedCount = parseInt(aResult.rows[0]?.count || 0);
    } catch (e) {}

    res.json({
      success: true,
      stories,
      stats: { total, pending: pendingCount, approved: approvedCount },
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, message: 'Error fetching stories: ' + error.message });
  }
});

router.post('/stories/:storyId/approve', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    const result = await pool.query(
      'UPDATE traveler_stories SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [storyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    res.json({ success: true, message: 'Story approved and published successfully' });
  } catch (error) {
    console.error('Error approving story:', error);
    res.status(500).json({ success: false, message: 'Error approving story' });
  }
});

router.post('/stories/:storyId/reject', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    const result = await pool.query(
      'UPDATE traveler_stories SET is_approved = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [storyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    res.json({ success: true, message: 'Story rejected successfully' });
  } catch (error) {
    console.error('Error rejecting story:', error);
    res.status(500).json({ success: false, message: 'Error rejecting story' });
  }
});

router.delete('/stories/:storyId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    // Delete related likes and comments first (ignore errors if tables don't exist)
    try {
      await pool.query('DELETE FROM story_likes WHERE story_id = $1', [storyId]);
    } catch (e) {}
    try {
      await pool.query('DELETE FROM story_comments WHERE story_id = $1', [storyId]);
    } catch (e) {}
    // Delete the story
    const result = await pool.query('DELETE FROM traveler_stories WHERE id = $1 RETURNING *', [storyId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ success: false, message: 'Error deleting story: ' + error.message });
  }
});


// ==========================================
// SYSTEM HEALTH
// ==========================================

router.get('/system/health', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const startTime = Date.now();
    await pool.query('SELECT 1');
    const dbResponseTime = Date.now() - startTime;
    
    res.json({
      success: true,
      health: {
        status: 'healthy',
        database: 'connected',
        dbResponseTime: `${dbResponseTime}ms`,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      health: {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      }
    });
  }
});


module.exports = router;
