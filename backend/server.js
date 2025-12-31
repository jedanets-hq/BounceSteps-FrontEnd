// iSafari Global Backend API
// Cart routes deployment fix - 2025-12-31 - FORCE DEPLOY WITH CART ROUTES
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Import PostgreSQL connection
const { connectPostgreSQL } = require('./config/postgresql');

// Create PostgreSQL pool for session store
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const travelerStoriesRoutes = require('./routes/travelerStories');
const providersRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin-fixed');
// Load cart, favorites, and plans routes with error handling
let cartRoutes, favoritesRoutes, plansRoutes;
try {
  cartRoutes = require('./routes/cart');
  console.log('✅ Cart routes module loaded');
} catch (error) {
  console.error('❌ Failed to load cart routes:', error.message);
  throw error;
}

try {
  favoritesRoutes = require('./routes/favorites');
  console.log('✅ Favorites routes module loaded');
} catch (error) {
  console.error('❌ Failed to load favorites routes:', error.message);
  throw error;
}

try {
  plansRoutes = require('./routes/plans');
  console.log('✅ Plans routes module loaded');
} catch (error) {
  console.error('❌ Failed to load plans routes:', error.message);
  throw error;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting (commented out for development)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// CORS configuration - Allow multiple origins including production
const allowedOrigins = [
  'http://localhost:4028',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://127.0.0.1:4028',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8082',
  'https://backend-bncb.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (origin && (
      origin.includes('.netlify.app') ||
      origin.includes('.vercel.app') ||
      origin.includes('onrender.com')
    )) {
      // Allow all Netlify, Vercel, and Render deployments
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with PostgreSQL store for production
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Use PostgreSQL session store in production
if (process.env.NODE_ENV === 'production') {
  sessionConfig.store = new pgSession({
    pool: sessionPool,
    tableName: 'session',
    createTableIfMissing: true
  });
}

app.use(session(sessionConfig));

// Initialize passport
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📨 [${timestamp}] ${req.method} ${req.path}`);
  
  // Log cart-related requests with more detail
  if (req.path.startsWith('/api/cart')) {
    console.log(`   🛒 Cart request detected`);
    console.log(`   Auth:`, req.headers.authorization ? 'Has Token' : 'No Token');
  }
  
  next();
});

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Middleware to ensure all API responses are JSON
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');

  // Override res.send to ensure JSON
  const originalSend = res.send;
  res.send = function (data) {
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
      } catch (e) {
        data = JSON.stringify({ success: false, message: data });
      }
    }
    res.setHeader('Content-Type', 'application/json');
    originalSend.call(this, data);
  };

  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/traveler-stories', travelerStoriesRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/admin', adminRoutes);

// Mount cart, favorites, and plans routes with verification
console.log('🔧 Mounting cart, favorites, and plans routes...');
app.use('/api/cart', cartRoutes);
console.log('✅ Cart routes mounted at /api/cart');

app.use('/api/favorites', favoritesRoutes);
console.log('✅ Favorites routes mounted at /api/favorites');

app.use('/api/plans', plansRoutes);
console.log('✅ Plans routes mounted at /api/plans');

// Verify cart routes loaded
console.log('\n📋 Cart API Endpoints:');
console.log('   - GET    /api/cart          (Get user cart)');
console.log('   - GET    /api/cart/test     (Test endpoint)');
console.log('   - POST   /api/cart/add      (Add to cart)');
console.log('   - PUT    /api/cart/:id      (Update quantity)');
console.log('   - DELETE /api/cart/:id      (Remove item)');
console.log('   - DELETE /api/cart          (Clear cart)');
console.log('');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'iSafari Global API is running',
    timestamp: new Date().toISOString(),
    routes: {
      cart: !!cartRoutes,
      favorites: !!favoritesRoutes,
      plans: !!plansRoutes
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Connect to PostgreSQL and start server
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectPostgreSQL();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 iSafari Global API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4028'}`);
      console.log(`💾 Database: PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
