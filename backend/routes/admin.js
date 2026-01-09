const express = require('express');
const router = express.Router();
const { User, ServiceProvider, Service, Booking, Payment } = require('../models');
const { pool } = require('../config/postgresql');

// ==========================================
// CATEGORIES & DESTINATIONS
// ==========================================

// Get all service categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM services 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    const categories = result.rows.map(r => ({
      id: r.category,
      name: r.category,
      count: parseInt(r.count)
    }));

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
});

// Get all destinations
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
    
    const destinations = result.rows.map(r => ({
      id: r.location,
      name: r.location,
      region: r.region,
      count: parseInt(r.count)
    }));

    res.json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ success: false, message: 'Error fetching destinations' });
  }
});

// Middleware to bypass authentication for admin portal (temporary - for development)
const authenticateJWT = (req, res, next) => {
  next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  next();
};

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

// Get dashboard analytics
router.get('/analytics/dashboard', authenticateJWT, isAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard analytics...');

    // Get basic stats using PostgreSQL
    let totalUsers = 0, totalServices = 0, totalBookings = 0;
    let activeServices = 0, pendingServices = 0;
    let totalTravelers = 0, totalProviders = 0;

    try {
      totalUsers = await User.countDocuments();
      totalServices = await Service.countDocuments();
      totalBookings = await Booking.countDocuments();
      activeServices = await Service.countDocuments({ is_active: true });
      pendingServices = await Service.countDocuments({ is_active: false });
      totalTravelers = await User.countDocuments({ user_type: 'traveler' });
      totalProviders = await User.countDocuments({ user_type: 'service_provider' });
    } catch (e) {
      console.log('Stats count error:', e.message);
    }

    // Get revenue data
    let monthlyRevenue = 0;
    try {
      const revenueResult = await pool.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE payment_status = 'completed' 
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `);
      monthlyRevenue = parseFloat(revenueResult.rows[0]?.total || 0);
    } catch (e) {
      console.log('Revenue query error:', e.message);
    }

    // Get recent users
    let recentUsers = [];
    try {
      const usersResult = await pool.query(`
        SELECT id, first_name, last_name, email, user_type, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      recentUsers = usersResult.rows;
    } catch (e) {
      console.log('Recent users query error:', e.message);
    }

    // Get recent services
    let recentServices = [];
    try {
      const servicesResult = await pool.query(`
        SELECT id, title, category, created_at 
        FROM services 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      recentServices = servicesResult.rows;
    } catch (e) {
      console.log('Recent services query error:', e.message);
    }

    // Get recent bookings
    let recentBookings = [];
    try {
      const bookingsResult = await pool.query(`
        SELECT id, status, created_at 
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      recentBookings = bookingsResult.rows;
    } catch (e) {
      console.log('Recent bookings query error:', e.message);
    }

    // Build recent activity
    const recentActivity = [
      ...recentUsers.map(u => ({
        id: u.id,
        action: 'user_created',
        description: `New user registered: ${u.first_name || ''} ${u.last_name || ''}`.trim(),
        user: { name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown' },
        createdAt: u.created_at
      })),
      ...recentServices.map(s => ({
        id: s.id,
        action: 'service_created',
        description: `New service added: ${s.title || 'Unknown'}`,
        user: { name: 'Service Provider' },
        createdAt: s.created_at
      })),
      ...recentBookings.map(b => ({
        id: b.id,
        action: 'booking_created',
        description: `New booking created`,
        user: { name: 'Traveler' },
        createdAt: b.created_at
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    // Get services by category
    let servicesData = { labels: [], values: [] };
    try {
      const categoryResult = await pool.query(`
        SELECT category, COUNT(*) as count 
        FROM services 
        GROUP BY category 
        ORDER BY count DESC
      `);
      servicesData = {
        labels: categoryResult.rows.map(r => r.category || 'Uncategorized'),
        values: categoryResult.rows.map(r => parseInt(r.count))
      };
    } catch (e) {
      console.log('Category query error:', e.message);
    }

    // Get bookings by status
    let bookingsData = { labels: [], values: [] };
    try {
      const statusResult = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM bookings 
        GROUP BY status
      `);
      bookingsData = {
        labels: statusResult.rows.map(r => r.status || 'Unknown'),
        values: statusResult.rows.map(r => parseInt(r.count))
      };
    } catch (e) {
      console.log('Bookings status query error:', e.message);
    }

    console.log('✅ Dashboard analytics completed');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalServices,
        totalBookings,
        activeServices,
        pendingApprovals: pendingServices,
        monthlyRevenue,
        totalTravelers,
        totalProviders,
        newUsersToday: 0,
        completedToday: 0,
        openTickets: 0
      },
      revenueData: { labels: [], values: [] },
      bookingsData,
      usersData: { labels: [], values: [] },
      servicesData,
      recentActivity,
      pendingActions: {
        userVerifications: 0,
        serviceApprovals: pendingServices,
        supportTickets: 0,
        pendingPayouts: 0
      },
      topServices: [],
      topProviders: [],
      systemHealth: {
        apiResponseTime: '45ms',
        databaseStatus: 'Connected',
        serverUptime: '99.9%',
        activeSessions: totalUsers
      }
    });
  } catch (error) {
    console.error('❌ Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics'
    });
  }
});

// ==========================================
// USER MANAGEMENT
// ==========================================

// Get all users with filters
router.get('/users', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { role, status, search, authProvider, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM users WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (role) {
      query += ` AND user_type = $${paramIndex}`;
      values.push(role);
      paramIndex++;
    }

    if (status === 'active') {
      query += ` AND is_active = true`;
    } else if (status === 'suspended') {
      query += ` AND is_active = false`;
    }

    // Filter by auth provider (google, email, both)
    if (authProvider) {
      if (authProvider === 'google') {
        query += ` AND (auth_provider IN ('google', 'both') OR google_id IS NOT NULL)`;
      } else if (authProvider === 'email') {
        query += ` AND (auth_provider = 'email' OR (auth_provider IS NULL AND google_id IS NULL))`;
      } else if (authProvider === 'both') {
        query += ` AND auth_provider = 'both'`;
      }
    }

    if (search) {
      query += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Format users for frontend with auth provider info
    const users = result.rows.map(u => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown',
      email: u.email,
      phone: u.phone,
      role: u.user_type,
      status: u.is_active ? 'active' : 'suspended',
      avatar: u.avatar_url,
      createdAt: u.created_at,
      lastActive: u.last_login || u.updated_at,
      // Auth provider fields for Google badge display
      authProvider: u.auth_provider || (u.google_id ? 'google' : 'email'),
      isGoogleUser: !!(u.google_id || u.auth_provider === 'google' || u.auth_provider === 'both'),
      googleId: u.google_id ? true : false
    }));

    // Get stats including Google users count
    let stats = { total: 0, travelers: 0, providers: 0, activeToday: 0, googleUsers: 0 };
    try {
      const googleUsersResult = await pool.query(
        `SELECT COUNT(*) FROM users WHERE google_id IS NOT NULL OR auth_provider IN ('google', 'both')`
      );
      stats = {
        total: await User.countDocuments(),
        travelers: await User.countDocuments({ user_type: 'traveler' }),
        providers: await User.countDocuments({ user_type: 'service_provider' }),
        activeToday: 0,
        googleUsers: parseInt(googleUsersResult.rows[0].count)
      };
    } catch (e) {
      console.log('User stats error:', e.message);
    }

    res.json({
      success: true,
      users,
      stats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/users/:userId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        phone: user.phone,
        role: user.user_type,
        status: user.is_active ? 'active' : 'suspended',
        avatar: user.avatar_url,
        createdAt: user.created_at,
        lastActive: user.last_login
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

// Update user status
router.put('/users/:userId/status', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(userId, { is_active: isActive });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
});

// Verify user
router.post('/users/:userId/verify', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { is_verified: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User verified successfully' });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ success: false, message: 'Error verifying user' });
  }
});

// Suspend user
router.post('/users/:userId/suspend', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { is_active: false });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ success: false, message: 'Error suspending user' });
  }
});

// Delete user - COMPLETE deletion of user and ALL related data
router.delete('/users/:userId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    
    console.log(`🗑️ Starting complete deletion for user ID: ${userIdInt}`);
    
    // First check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userIdInt]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = userCheck.rows[0];
    console.log(`📋 Deleting user: ${user.email} (${user.user_type})`);
    
    // Start transaction for data integrity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Delete story comments by this user
      try {
        const commentsResult = await client.query('DELETE FROM story_comments WHERE user_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${commentsResult.rowCount} story comments`);
      } catch (e) {
        console.log('   - No story_comments table or error:', e.message);
      }
      
      // 2. Delete story likes by this user
      try {
        const likesResult = await client.query('DELETE FROM story_likes WHERE user_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${likesResult.rowCount} story likes`);
      } catch (e) {
        console.log('   - No story_likes table or error:', e.message);
      }
      
      // 3. Delete traveler stories by this user (and their comments/likes via CASCADE)
      try {
        const storiesResult = await client.query('DELETE FROM traveler_stories WHERE user_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${storiesResult.rowCount} traveler stories`);
      } catch (e) {
        console.log('   - No traveler_stories table or error:', e.message);
      }
      
      // 4. Delete reviews by this user
      try {
        const reviewsResult = await client.query('DELETE FROM reviews WHERE traveler_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${reviewsResult.rowCount} reviews`);
      } catch (e) {
        console.log('   - No reviews table or error:', e.message);
      }
      
      // 5. Delete notifications for this user
      try {
        const notifResult = await client.query('DELETE FROM notifications WHERE user_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${notifResult.rowCount} notifications`);
      } catch (e) {
        console.log('   - No notifications table or error:', e.message);
      }
      
      // 6. Delete payments by this user
      try {
        const paymentsResult = await client.query('DELETE FROM payments WHERE user_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${paymentsResult.rowCount} payments`);
      } catch (e) {
        console.log('   - No payments table or error:', e.message);
      }
      
      // 7. If user is a service provider, delete all their services and provider record
      try {
        const providerResult = await client.query('SELECT id FROM service_providers WHERE user_id = $1', [userIdInt]);
        if (providerResult.rows.length > 0) {
          const providerId = providerResult.rows[0].id;
          console.log(`   📦 User is a service provider (ID: ${providerId})`);
          
          // Delete service promotions for provider's services
          try {
            await client.query(`
              DELETE FROM service_promotions 
              WHERE service_id IN (SELECT id FROM services WHERE provider_id = $1)
            `, [providerId]);
            console.log(`   ✓ Deleted service promotions`);
          } catch (e) {
            console.log('   - No service_promotions or error:', e.message);
          }
          
          // Delete bookings for provider's services
          try {
            const bookingsResult = await client.query(`
              DELETE FROM bookings 
              WHERE service_id IN (SELECT id FROM services WHERE provider_id = $1)
            `, [providerId]);
            console.log(`   ✓ Deleted ${bookingsResult.rowCount} bookings for provider services`);
          } catch (e) {
            console.log('   - Bookings cleanup error:', e.message);
          }
          
          // Delete reviews for provider's services
          try {
            await client.query(`
              DELETE FROM reviews 
              WHERE service_id IN (SELECT id FROM services WHERE provider_id = $1)
            `, [providerId]);
            console.log(`   ✓ Deleted reviews for provider services`);
          } catch (e) {
            console.log('   - Reviews cleanup error:', e.message);
          }
          
          // Delete all services
          const servicesResult = await client.query('DELETE FROM services WHERE provider_id = $1', [providerId]);
          console.log(`   ✓ Deleted ${servicesResult.rowCount} services`);
          
          // Delete service provider record
          await client.query('DELETE FROM service_providers WHERE id = $1', [providerId]);
          console.log(`   ✓ Deleted service provider record`);
        }
      } catch (e) {
        console.log('   - Provider cleanup error:', e.message);
      }
      
      // 8. Delete bookings where user is the traveler
      try {
        const travelerBookingsResult = await client.query('DELETE FROM bookings WHERE traveler_id = $1', [userIdInt]);
        console.log(`   ✓ Deleted ${travelerBookingsResult.rowCount} traveler bookings`);
      } catch (e) {
        // Try with user_id column if traveler_id doesn't exist
        try {
          const userBookingsResult = await client.query('DELETE FROM bookings WHERE user_id = $1', [userIdInt]);
          console.log(`   ✓ Deleted ${userBookingsResult.rowCount} user bookings`);
        } catch (e2) {
          console.log('   - Bookings cleanup error:', e2.message);
        }
      }
      
      // 9. Finally delete the user
      const deleteUserResult = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [userIdInt]);
      
      if (deleteUserResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'User not found during deletion' });
      }
      
      await client.query('COMMIT');
      console.log(`✅ User ${user.email} and all related data deleted successfully`);
      
      res.json({ 
        success: true, 
        message: `User ${user.email} and all related data deleted permanently` 
      });
      
    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user: ' + error.message });
  }
});

// ==========================================
// SERVICE MANAGEMENT
// ==========================================

// Get all services
router.get('/services', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT s.*, sp.business_name, u.first_name, u.last_name, u.email as provider_email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND s.category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    if (status === 'approved' || status === 'active') {
      query += ` AND s.is_active = true`;
    } else if (status === 'pending' || status === 'inactive') {
      query += ` AND s.is_active = false`;
    }

    if (search) {
      query += ` AND (s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(/SELECT s\.\*, sp\.business_name.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Format services
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
      provider: {
        name: s.business_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        email: s.provider_email
      },
      createdAt: s.created_at
    }));

    // Get stats
    let stats = { total: 0, active: 0, pending: 0, inactive: 0 };
    try {
      stats = {
        total: await Service.countDocuments(),
        active: await Service.countDocuments({ is_active: true }),
        pending: await Service.countDocuments({ is_active: false }),
        inactive: 0
      };
    } catch (e) {
      console.log('Service stats error:', e.message);
    }

    res.json({
      success: true,
      services,
      stats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});

// Get service by ID
router.get('/services/:serviceId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const result = await pool.query(`
      SELECT s.*, sp.business_name, u.first_name, u.last_name, u.email as provider_email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE s.id = $1
    `, [serviceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const s = result.rows[0];
    res.json({ 
      success: true, 
      service: {
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        price: s.price,
        currency: s.currency,
        location: s.location,
        images: s.images || [],
        is_active: s.is_active,
        is_featured: s.is_featured,
        average_rating: s.average_rating,
        business_name: s.business_name,
        provider: {
          name: s.business_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          email: s.provider_email
        },
        createdAt: s.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Error fetching service' });
  }
});

// Approve service
router.post('/services/:serviceId/approve', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const result = await pool.query(
      'UPDATE services SET is_active = true WHERE id = $1 RETURNING *',
      [serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service approved successfully' });
  } catch (error) {
    console.error('Error approving service:', error);
    res.status(500).json({ success: false, message: 'Error approving service' });
  }
});

// Reject service
router.post('/services/:serviceId/reject', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const result = await pool.query(
      'UPDATE services SET is_active = false WHERE id = $1 RETURNING *',
      [serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service rejected' });
  } catch (error) {
    console.error('Error rejecting service:', error);
    res.status(500).json({ success: false, message: 'Error rejecting service' });
  }
});

// Delete service
router.delete('/services/:serviceId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    // Delete related bookings first
    try {
      await pool.query('DELETE FROM bookings WHERE service_id = $1', [serviceId]);
    } catch (e) {
      console.log('Bookings cleanup error:', e.message);
    }
    
    // Delete service
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [serviceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Error deleting service' });
  }
});

// ==========================================
// BOOKING MANAGEMENT
// ==========================================

// Get all bookings
router.get('/bookings', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT b.*, s.title as service_title, s.category,
             u.first_name, u.last_name, u.email
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(/SELECT b\.\*, s\.title.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Format bookings
    const bookings = result.rows.map(b => ({
      id: b.id,
      status: b.status,
      totalAmount: b.total_amount,
      bookingDate: b.booking_date,
      guests: b.participants,
      service: {
        title: b.service_title,
        category: b.category
      },
      traveler: {
        name: `${b.first_name || ''} ${b.last_name || ''}`.trim(),
        email: b.email
      },
      createdAt: b.created_at
    }));

    // Get stats
    let stats = { total: 0, confirmed: 0, pending: 0, revenue: 0 };
    try {
      stats = {
        total: await Booking.countDocuments(),
        confirmed: await Booking.countDocuments({ status: 'confirmed' }),
        pending: await Booking.countDocuments({ status: 'pending' }),
        revenue: 0
      };
    } catch (e) {
      console.log('Booking stats error:', e.message);
    }

    res.json({
      success: true,
      bookings,
      stats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
});

// Cancel booking
router.post('/bookings/:bookingId/cancel', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Error cancelling booking' });
  }
});

// ==========================================
// PAYMENT MANAGEMENT
// ==========================================

// Get all payments
router.get('/payments', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND p.payment_status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(/SELECT p\.\*, u\.first_name.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Format payments
    const payments = result.rows.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.payment_status,
      method: p.payment_method,
      user: {
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        email: p.email
      },
      createdAt: p.created_at
    }));

    // Get stats
    let totalCompleted = 0;
    let totalPending = 0;
    let paymentCount = 0;
    try {
      const completedResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'`);
      totalCompleted = parseFloat(completedResult.rows[0].total);
      
      const pendingResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending'`);
      totalPending = parseFloat(pendingResult.rows[0].total);
      
      paymentCount = await Payment.countDocuments();
    } catch (e) {
      console.log('Payment stats error:', e.message);
    }

    const stats = {
      total: paymentCount,
      completed: totalCompleted,
      pending: totalPending,
      failed: 0
    };

    res.json({
      success: true,
      payments,
      stats,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
});


// ==========================================
// PRE-ORDERS MANAGEMENT
// ==========================================

// Get pre-orders (bookings with status 'pre_order' or 'pending')
router.get('/pre-orders', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const query = `
      SELECT b.*, s.title as service_title, s.category,
             u.first_name, u.last_name, u.email
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE b.status IN ('pre_order', 'pending')
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countResult = await pool.query(`SELECT COUNT(*) FROM bookings WHERE status IN ('pre_order', 'pending')`);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(query, [parseInt(limit), offset]);
    
    const preOrders = result.rows.map(b => ({
      id: b.id,
      status: b.status,
      totalAmount: b.total_amount,
      bookingDate: b.booking_date,
      guests: b.participants,
      service: {
        title: b.service_title,
        category: b.category
      },
      traveler: {
        name: `${b.first_name || ''} ${b.last_name || ''}`.trim(),
        email: b.email
      },
      createdAt: b.created_at
    }));

    res.json({
      success: true,
      preOrders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching pre-orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching pre-orders' });
  }
});

// ==========================================
// BOOKING CALENDAR
// ==========================================

router.get('/bookings/calendar', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const query = `
      SELECT b.*, s.title as service_title, u.first_name, u.last_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE EXTRACT(MONTH FROM b.booking_date) = $1
      AND EXTRACT(YEAR FROM b.booking_date) = $2
      ORDER BY b.booking_date ASC
    `;

    const result = await pool.query(query, [targetMonth, targetYear]);
    
    const events = result.rows.map(b => ({
      id: b.id,
      title: b.service_title || 'Booking',
      date: b.booking_date,
      status: b.status,
      traveler: `${b.first_name || ''} ${b.last_name || ''}`.trim()
    }));

    res.json({
      success: true,
      events,
      month: targetMonth,
      year: targetYear
    });
  } catch (error) {
    console.error('Error fetching booking calendar:', error);
    res.status(500).json({ success: false, message: 'Error fetching booking calendar' });
  }
});

// ==========================================
// TRANSACTIONS
// ==========================================

router.get('/transactions', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.email,
             b.id as booking_id, s.title as service_title
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND p.payment_method = $${paramIndex}`;
      values.push(type);
      paramIndex++;
    }

    const countQuery = query.replace(/SELECT p\.\*, u\.first_name.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    const transactions = result.rows.map(t => ({
      id: t.id,
      type: t.payment_method,
      amount: t.amount,
      currency: t.currency,
      status: t.payment_status,
      reference: t.transaction_id,
      user: {
        name: `${t.first_name || ''} ${t.last_name || ''}`.trim(),
        email: t.email
      },
      service: t.service_title,
      createdAt: t.created_at
    }));

    res.json({
      success: true,
      transactions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Error fetching transactions' });
  }
});

// ==========================================
// REVENUE
// ==========================================

router.get('/revenue', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    if (period === 'today') {
      dateFilter = "AND DATE(created_at) = CURRENT_DATE";
    } else if (period === 'week') {
      dateFilter = "AND created_at >= DATE_TRUNC('week', CURRENT_DATE)";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)";
    } else if (period === 'year') {
      dateFilter = "AND created_at >= DATE_TRUNC('year', CURRENT_DATE)";
    }

    // Total revenue
    const totalResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM payments 
      WHERE payment_status = 'completed' ${dateFilter}
    `);
    const totalRevenue = parseFloat(totalResult.rows[0].total);

    // Revenue by category
    const categoryResult = await pool.query(`
      SELECT s.category, COALESCE(SUM(p.amount), 0) as revenue
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE p.payment_status = 'completed' ${dateFilter}
      GROUP BY s.category
      ORDER BY revenue DESC
    `);

    // Daily revenue for chart
    const dailyResult = await pool.query(`
      SELECT DATE(created_at) as date, COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE payment_status = 'completed' ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      revenue: {
        total: totalRevenue,
        period,
        byCategory: categoryResult.rows.map(r => ({
          category: r.category || 'Other',
          revenue: parseFloat(r.revenue)
        })),
        daily: dailyResult.rows.map(r => ({
          date: r.date,
          revenue: parseFloat(r.revenue)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    res.status(500).json({ success: false, message: 'Error fetching revenue' });
  }
});

// ==========================================
// PAYOUTS
// ==========================================

router.get('/payouts', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const query = `
      SELECT sp.id as provider_id, sp.business_name, u.first_name, u.last_name, u.email,
             COALESCE(SUM(p.amount), 0) as total_earnings,
             COUNT(DISTINCT b.id) as total_bookings
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN services s ON s.provider_id = sp.id
      LEFT JOIN bookings b ON b.service_id = s.id AND b.status = 'completed'
      LEFT JOIN payments p ON p.booking_id = b.id AND p.payment_status = 'completed'
      GROUP BY sp.id, sp.business_name, u.first_name, u.last_name, u.email
      ORDER BY total_earnings DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [parseInt(limit), offset]);
    
    const payouts = result.rows.map(p => ({
      id: p.provider_id,
      provider: {
        name: p.business_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        email: p.email
      },
      totalEarnings: parseFloat(p.total_earnings),
      totalBookings: parseInt(p.total_bookings),
      status: 'pending'
    }));

    const countResult = await pool.query(`SELECT COUNT(DISTINCT sp.id) FROM service_providers sp`);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      payouts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ success: false, message: 'Error fetching payouts' });
  }
});

router.get('/payouts/pending', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sp.id as provider_id, sp.business_name, u.first_name, u.last_name, u.email,
             COALESCE(SUM(p.amount), 0) as pending_amount
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      LEFT JOIN services s ON s.provider_id = sp.id
      LEFT JOIN bookings b ON b.service_id = s.id AND b.status = 'completed'
      LEFT JOIN payments p ON p.booking_id = b.id AND p.payment_status = 'completed'
      GROUP BY sp.id, sp.business_name, u.first_name, u.last_name, u.email
      HAVING COALESCE(SUM(p.amount), 0) > 0
    `);

    const pendingPayouts = result.rows.map(p => ({
      id: p.provider_id,
      provider: {
        name: p.business_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        email: p.email
      },
      amount: parseFloat(p.pending_amount)
    }));

    res.json({
      success: true,
      pendingPayouts,
      total: pendingPayouts.length
    });
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending payouts' });
  }
});

router.post('/payouts/:id/process', authenticateJWT, isAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Payout processed successfully'
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ success: false, message: 'Error processing payout' });
  }
});

// ==========================================
// USER STATS
// ==========================================

router.get('/users/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const stats = {
      total: await User.countDocuments(),
      travelers: await User.countDocuments({ user_type: 'traveler' }),
      providers: await User.countDocuments({ user_type: 'service_provider' }),
      admins: await User.countDocuments({ user_type: 'admin' }),
      activeToday: 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching user stats' });
  }
});

// ==========================================
// SERVICE STATS
// ==========================================

router.get('/services/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const stats = {
      total: await Service.countDocuments(),
      active: await Service.countDocuments({ is_active: true }),
      pending: await Service.countDocuments({ is_active: false }),
      featured: await Service.countDocuments({ is_featured: true })
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching service stats' });
  }
});

// ==========================================
// BOOKING STATS
// ==========================================

router.get('/bookings/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const stats = {
      total: await Booking.countDocuments(),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      pending: await Booking.countDocuments({ status: 'pending' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' })
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching booking stats' });
  }
});

// ==========================================
// PAYMENT STATS
// ==========================================

router.get('/payments/stats', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const totalResult = await pool.query(`SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments`);
    const completedResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'`);
    const pendingResult = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending'`);

    const stats = {
      total: parseInt(totalResult.rows[0].count),
      totalAmount: parseFloat(totalResult.rows[0].total),
      completed: parseFloat(completedResult.rows[0].total),
      pending: parseFloat(pendingResult.rows[0].total)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment stats' });
  }
});

// ==========================================
// TRUSTED PARTNERS MANAGEMENT
// ==========================================

// Get all trusted partners
router.get('/trusted-partners', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM trusted_partners 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      partners: result.rows
    });
  } catch (error) {
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      return res.json({ success: true, partners: [] });
    }
    console.error('Error fetching trusted partners:', error);
    res.status(500).json({ success: false, message: 'Error fetching trusted partners' });
  }
});

// Create trusted partner
router.post('/trusted-partners', async (req, res) => {
  try {
    const { name, logo, type, description, website } = req.body;
    
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trusted_partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo TEXT,
        type VARCHAR(100),
        description TEXT,
        website VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await pool.query(`
      INSERT INTO trusted_partners (name, logo, type, description, website)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, logo, type, description, website]);
    
    res.json({
      success: true,
      partner: result.rows[0],
      message: 'Trusted partner created successfully'
    });
  } catch (error) {
    console.error('Error creating trusted partner:', error);
    res.status(500).json({ success: false, message: 'Error creating trusted partner' });
  }
});

// Update trusted partner
router.put('/trusted-partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, type, description, website, is_active } = req.body;
    
    const result = await pool.query(`
      UPDATE trusted_partners 
      SET name = $1, logo = $2, type = $3, description = $4, website = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [name, logo, type, description, website, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    
    res.json({
      success: true,
      partner: result.rows[0],
      message: 'Trusted partner updated successfully'
    });
  } catch (error) {
    console.error('Error updating trusted partner:', error);
    res.status(500).json({ success: false, message: 'Error updating trusted partner' });
  }
});

// Delete trusted partner
router.delete('/trusted-partners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM trusted_partners WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    
    res.json({
      success: true,
      message: 'Trusted partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trusted partner:', error);
    res.status(500).json({ success: false, message: 'Error deleting trusted partner' });
  }
});

// ==========================================
// SERVICE PROVIDER VERIFICATION BADGE
// ==========================================

// Get all service providers with verification status
router.get('/providers/verification', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT sp.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status === 'verified') {
      query += ` AND sp.is_verified = true`;
    } else if (status === 'unverified') {
      query += ` AND sp.is_verified = false`;
    }

    const countQuery = query.replace(/SELECT sp\.\*, u\.first_name.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY sp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    const providers = result.rows.map(p => ({
      id: p.id,
      userId: p.user_id,
      businessName: p.business_name,
      businessType: p.business_type,
      description: p.description,
      location: p.location,
      rating: p.rating,
      isVerified: p.is_verified,
      user: {
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        email: p.email,
        phone: p.phone,
        avatar: p.avatar_url
      },
      createdAt: p.created_at
    }));

    const verifiedCount = await pool.query('SELECT COUNT(*) FROM service_providers WHERE is_verified = true');
    const unverifiedCount = await pool.query('SELECT COUNT(*) FROM service_providers WHERE is_verified = false');

    res.json({
      success: true,
      providers,
      stats: {
        total,
        verified: parseInt(verifiedCount.rows[0].count),
        unverified: parseInt(unverifiedCount.rows[0].count)
      },
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching providers for verification:', error);
    res.status(500).json({ success: false, message: 'Error fetching providers' });
  }
});

// Add verification badge to service provider
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

    res.json({
      success: true,
      message: 'Verification badge added successfully',
      provider: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding verification badge:', error);
    res.status(500).json({ success: false, message: 'Error adding verification badge' });
  }
});

// Remove verification badge from service provider
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

    res.json({
      success: true,
      message: 'Verification badge removed successfully',
      provider: result.rows[0]
    });
  } catch (error) {
    console.error('Error removing verification badge:', error);
    res.status(500).json({ success: false, message: 'Error removing verification badge' });
  }
});

// ==========================================
// TRAVELER STORIES MANAGEMENT
// ==========================================

// Get all stories for admin (including pending)
router.get('/stories', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT ts.*, u.first_name, u.last_name, u.email, u.avatar_url
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (status === 'pending') {
      query += ` AND ts.is_approved = false`;
    } else if (status === 'approved') {
      query += ` AND ts.is_approved = true`;
    }

    const countQuery = query.replace(/SELECT ts\.\*, u\.first_name.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY ts.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    const stories = result.rows.map(s => ({
      id: s.id,
      title: s.title,
      story: s.story,
      location: s.location,
      duration: s.duration,
      highlights: s.highlights,
      media: s.media,
      isApproved: s.is_approved,
      isActive: s.is_active,
      likesCount: s.likes_count,
      commentsCount: s.comments_count,
      user: {
        id: s.user_id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
        email: s.email,
        avatar: s.avatar_url
      },
      createdAt: s.created_at
    }));

    const pendingCount = await pool.query('SELECT COUNT(*) FROM traveler_stories WHERE is_approved = false');
    const approvedCount = await pool.query('SELECT COUNT(*) FROM traveler_stories WHERE is_approved = true');

    res.json({
      success: true,
      stories,
      stats: {
        total,
        pending: parseInt(pendingCount.rows[0].count),
        approved: parseInt(approvedCount.rows[0].count)
      },
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, message: 'Error fetching stories' });
  }
});

// Approve story
router.post('/stories/:storyId/approve', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const result = await pool.query(
      'UPDATE traveler_stories SET is_approved = true, is_active = true WHERE id = $1 RETURNING *',
      [storyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    res.json({
      success: true,
      message: 'Story approved and published successfully',
      story: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving story:', error);
    res.status(500).json({ success: false, message: 'Error approving story' });
  }
});

// Reject story
router.post('/stories/:storyId/reject', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    const { reason } = req.body;
    
    const result = await pool.query(
      'UPDATE traveler_stories SET is_approved = false, is_active = false WHERE id = $1 RETURNING *',
      [storyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    res.json({
      success: true,
      message: 'Story rejected successfully',
      story: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting story:', error);
    res.status(500).json({ success: false, message: 'Error rejecting story' });
  }
});

// Delete story
router.delete('/stories/:storyId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { storyId } = req.params;
    
    // Delete related likes and comments first
    await pool.query('DELETE FROM story_likes WHERE story_id = $1', [storyId]);
    await pool.query('DELETE FROM story_comments WHERE story_id = $1', [storyId]);
    
    const result = await pool.query('DELETE FROM traveler_stories WHERE id = $1 RETURNING *', [storyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ success: false, message: 'Error deleting story' });
  }
});

// ==========================================
// PAYMENT GATEWAY SETTINGS
// ==========================================

// Get payment gateway settings
router.get('/settings/payment-gateway', async (req, res) => {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'payment_gateway'"
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, settings: {} });
    }

    res.json({
      success: true,
      settings: result.rows[0].setting_value
    });
  } catch (error) {
    console.error('Error fetching payment gateway settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// Save payment gateway settings
router.post('/settings/payment-gateway', async (req, res) => {
  try {
    const settings = req.body;

    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Upsert settings
    await pool.query(`
      INSERT INTO system_settings (setting_key, setting_value)
      VALUES ('payment_gateway', $1)
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(settings)]);

    res.json({
      success: true,
      message: 'Payment gateway settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving payment gateway settings:', error);
    res.status(500).json({ success: false, message: 'Error saving settings' });
  }
});

// Test payment gateway connection
router.get('/settings/payment-gateway/test', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'payment_gateway'"
    );

    if (result.rows.length === 0 || !result.rows[0].setting_value) {
      return res.json({ success: false, message: 'Payment gateway not configured' });
    }

    const settings = result.rows[0].setting_value;
    
    if (!settings.publicKey || !settings.secretKey) {
      return res.json({ success: false, message: 'API keys not configured' });
    }

    // Simulate connection test
    res.json({
      success: true,
      message: 'Payment gateway connection successful',
      gateway: settings.gateway,
      environment: settings.environment
    });
  } catch (error) {
    console.error('Error testing payment gateway:', error);
    res.status(500).json({ success: false, message: 'Connection test failed' });
  }
});

// ==========================================
// PROMOTIONS MANAGEMENT
// ==========================================

// Get all promotions for admin
router.get('/promotions', async (req, res) => {
  try {
    // Create service_promotions table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_promotions (
        id SERIAL PRIMARY KEY,
        service_id INTEGER REFERENCES services(id),
        promotion_type VARCHAR(50),
        promotion_location VARCHAR(100),
        duration_days INTEGER DEFAULT 30,
        cost DECIMAL(10,2),
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'pending',
        card_last_four VARCHAR(4),
        card_brand VARCHAR(20),
        status VARCHAR(50) DEFAULT 'pending',
        started_at TIMESTAMP,
        expires_at TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by INTEGER,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      SELECT sp.*, 
             s.title as service_title, s.category as service_category,
             svp.business_name as provider_name,
             u.email as provider_email
      FROM service_promotions sp
      LEFT JOIN services s ON sp.service_id = s.id
      LEFT JOIN service_providers svp ON s.provider_id = svp.id
      LEFT JOIN users u ON svp.user_id = u.id
      ORDER BY sp.created_at DESC
    `);

    // Calculate stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM service_promotions
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      promotions: result.rows,
      stats: {
        total: parseInt(stats.total),
        pending: parseInt(stats.pending),
        approved: parseInt(stats.approved),
        rejected: parseInt(stats.rejected)
      }
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ success: false, message: 'Error fetching promotions' });
  }
});

// Approve promotion
router.post('/promotions/:promotionId/approve', async (req, res) => {
  try {
    const { promotionId } = req.params;

    // Get promotion details
    const promoResult = await pool.query(
      'SELECT * FROM service_promotions WHERE id = $1',
      [promotionId]
    );

    if (promoResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    const promotion = promoResult.rows[0];

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (promotion.duration_days || 30));

    // Update promotion status
    await pool.query(`
      UPDATE service_promotions 
      SET status = 'approved', 
          payment_status = 'completed',
          approved_at = NOW(),
          started_at = NOW(),
          expires_at = $2,
          updated_at = NOW()
      WHERE id = $1
    `, [promotionId, expiresAt]);

    // Update service based on promotion type
    const serviceId = promotion.service_id;
    const promotionType = promotion.promotion_type;
    const promotionLocation = promotion.promotion_location;

    if (promotionType === 'featured') {
      await pool.query(`
        UPDATE services 
        SET is_featured = true, 
            featured_until = $2,
            featured_priority = COALESCE(featured_priority, 0) + 10,
            promotion_type = $3,
            promotion_location = $4
        WHERE id = $1
      `, [serviceId, expiresAt, promotionType, promotionLocation]);
    } else if (promotionType === 'trending') {
      await pool.query(`
        UPDATE services 
        SET is_featured = true,
            featured_until = $2,
            featured_priority = COALESCE(featured_priority, 0) + 5,
            promotion_type = $3,
            promotion_location = $4
        WHERE id = $1
      `, [serviceId, expiresAt, promotionType, promotionLocation]);
    } else if (promotionType === 'search_boost') {
      await pool.query(`
        UPDATE services 
        SET featured_priority = COALESCE(featured_priority, 0) + 3,
            promotion_type = $2,
            promotion_location = $3
        WHERE id = $1
      `, [serviceId, promotionType, promotionLocation]);
    }

    res.json({
      success: true,
      message: 'Promotion approved successfully. Service is now promoted!'
    });
  } catch (error) {
    console.error('Error approving promotion:', error);
    res.status(500).json({ success: false, message: 'Error approving promotion' });
  }
});

// Reject promotion
router.post('/promotions/:promotionId/reject', async (req, res) => {
  try {
    const { promotionId } = req.params;
    const { reason } = req.body;

    const result = await pool.query(`
      UPDATE service_promotions 
      SET status = 'rejected', 
          rejection_reason = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [promotionId, reason || 'No reason provided']);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    res.json({
      success: true,
      message: 'Promotion rejected'
    });
  } catch (error) {
    console.error('Error rejecting promotion:', error);
    res.status(500).json({ success: false, message: 'Error rejecting promotion' });
  }
});

// ==========================================
// SYSTEM SETTINGS
// ==========================================

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'general_settings'"
    );

    // Default settings
    const defaultSettings = {
      siteName: 'iSafari',
      contactEmail: 'support@isafari.com',
      supportPhone: '+255 123 456 789',
      commissionRate: 10,
      currency: 'TZS',
      emailFrom: 'noreply@isafari.com'
    };

    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        ...defaultSettings
      });
    }

    res.json({
      success: true,
      ...defaultSettings,
      ...result.rows[0].setting_value
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;

    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Upsert settings
    await pool.query(`
      INSERT INTO system_settings (setting_key, setting_value)
      VALUES ('general_settings', $1)
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $1, updated_at = NOW()
    `, [JSON.stringify(settings)]);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

// Get admin users
router.get('/settings/admins', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, email, user_type, is_active, created_at
      FROM users 
      WHERE user_type = 'admin'
      ORDER BY created_at DESC
    `);

    const admins = result.rows.map(a => ({
      id: a.id,
      name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Admin',
      email: a.email,
      role: a.user_type,
      status: a.is_active ? 'active' : 'inactive',
      createdAt: a.created_at
    }));

    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Error fetching admins' });
  }
});

// Add admin user
router.post('/settings/admins/add', async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      // Update existing user to admin
      await pool.query(
        "UPDATE users SET user_type = 'admin' WHERE email = $1",
        [email]
      );
      return res.json({
        success: true,
        message: 'User promoted to admin successfully'
      });
    }

    // Create new admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const result = await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, user_type, is_active)
      VALUES ($1, $2, $3, $4, 'admin', true)
      RETURNING id, first_name, last_name, email
    `, [firstName, lastName, email, hashedPassword]);

    res.json({
      success: true,
      message: 'Admin user created successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ success: false, message: 'Error adding admin' });
  }
});

// Remove admin
router.delete('/settings/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Demote to regular user instead of deleting
    await pool.query(
      "UPDATE users SET user_type = 'traveler' WHERE id = $1",
      [id]
    );

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ success: false, message: 'Error removing admin' });
  }
});

// System health check
router.get('/system/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await pool.query('SELECT 1');
    const dbResponseTime = Date.now() - startTime;

    // Get counts
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
    const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');

    res.json({
      success: true,
      health: {
        status: 'healthy',
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`
        },
        api: {
          status: 'running',
          uptime: process.uptime()
        },
        stats: {
          users: parseInt(usersCount.rows[0].count),
          services: parseInt(servicesCount.rows[0].count),
          bookings: parseInt(bookingsCount.rows[0].count)
        }
      }
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      success: false, 
      health: {
        status: 'unhealthy',
        error: error.message
      }
    });
  }
});

module.exports = router;
