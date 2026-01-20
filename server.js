const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

const app = express();

// Import database initialization
const { runStartupMigrations } = require('./migrations/run-on-startup');

// Import routes
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const bookingsRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

// CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      // Production domains
      /\.netlify\.app$/,  // Allows all Netlify subdomains
      /\.onrender\.com$/  // Allows all Render domains
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        console.log('⚠️  Development mode - allowing origin anyway');
        callback(null, true);
      } else {
        console.log('❌ Production mode - blocking unauthorized origin');
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
require('./config/passport');
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'iSafari Global API',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'iSafari Global API - Travel & Tourism Platform',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

async function testDatabaseConnection() {
  try {
    const { pool } = require('./config/postgresql');
    const result = await pool.query('SELECT NOW() as now, current_database() as database');
    console.log('✅ Database connection test successful');
    console.log('   Database:', result.rows[0].database);
    console.log('   Timestamp:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('   Make sure DATABASE_URL or DB_* environment variables are set correctly');
    return false;
  }
}

async function testJWTSecret() {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is not set!');
    console.error('   Add JWT_SECRET to your environment variables');
    return false;
  }
  console.log('✅ JWT_SECRET is configured');
  return true;
}

async function startServer() {
  try {
    console.log('');
    console.log('🌍 ========================================');
    console.log('🚀 iSafari Global API Server Starting...');
    console.log('========================================');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    
    // Test JWT Secret
    const jwtOk = await testJWTSecret();
    
    // Test database connection
    const dbOk = await testDatabaseConnection();
    
    if (!dbOk) {
      console.warn('⚠️  WARNING: Database connection failed!');
      console.warn('   Server will start but registration/login will not work');
      console.warn('   Please check your DATABASE_URL environment variable');
    }
    
    if (!jwtOk) {
      console.warn('⚠️  WARNING: JWT_SECRET not configured!');
      console.warn('   Authentication will not work properly');
    }
    
    console.log('');
    
    // Run startup migrations
    await runStartupMigrations();
    
    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('🌍 ========================================');
      console.log('🚀 iSafari Global API Server Started');
      console.log('========================================');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 CORS: Enabled for production domains`);
      console.log(`🗄️  Database: ${dbOk ? '✅ Connected' : '❌ Not Connected'}`);
      console.log(`🔑 JWT: ${jwtOk ? '✅ Configured' : '❌ Not Configured'}`);
      console.log('========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
