# iSafari Global - Production Deployment Guide

## 🚀 Complete Production Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database setup
- Google Cloud Console project
- Stripe account (optional)
- M-Pesa developer account (optional)

## 1. Database Setup

### PostgreSQL Database Configuration
```sql
-- Create database
CREATE DATABASE i_SAFARI_DATABASE;

-- Connect to database and run the schema from backend/config/database.js
-- All tables will be created automatically when the server starts
```

### Environment Variables Setup

#### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=i_SAFARI_DATABASE
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_business_short_code
MPESA_PASSKEY=your_mpesa_passkey

# Session Configuration
SESSION_SECRET=your_session_secret_key

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:4028
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:4028
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 2. Google OAuth Setup

### Step-by-Step Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set **Application type** to "Web application"
6. Add **Authorized redirect URIs**:
   - `http://localhost:5000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
7. Copy **Client ID** and **Client Secret** to your `.env` files

## 3. Payment Integration Setup

### Stripe Setup
1. Create account at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from **Developers** → **API keys**
3. Add webhook endpoint: `http://localhost:5000/api/payments/stripe/webhook`
4. Copy keys to environment variables

### M-Pesa Setup (Kenya)
1. Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create a new app and get credentials
3. Set up STK Push and callback URLs
4. Add credentials to environment variables

## 4. Installation & Build

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
npm install
npm run build
npm run preview
```

## 5. Production Deployment Options

### Option 1: Local Production Server
```bash
# Backend
cd backend && npm start

# Frontend (in new terminal)
npm run build && npm run preview
```

### Option 2: Docker Deployment
```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Option 3: Cloud Deployment
- **Heroku**: Use provided Procfile
- **Vercel**: Deploy frontend, use serverless functions for API
- **AWS**: Use EC2 or Elastic Beanstalk
- **DigitalOcean**: Use App Platform or Droplets

## 6. System Features

### ✅ Completed Features
- **Authentication System**: Registration, login, Google OAuth
- **Role-Based Access**: Traveler and Service Provider dashboards
- **Payment Integration**: Stripe and M-Pesa support
- **Premium Services**: Featured listings and premium memberships
- **Booking System**: Complete booking workflow
- **Notifications**: Real-time notifications system
- **Database**: PostgreSQL with comprehensive schema
- **Security**: JWT authentication, input validation, CORS

### 🎯 Key Functionality
1. **Multi-User Support**: Each user has isolated data and personalized dashboard
2. **Payment Processing**: Real payment methods for premium features
3. **Service Management**: Providers can add/manage services
4. **Booking Management**: Complete booking lifecycle
5. **Search & Discovery**: Advanced search with premium prioritization
6. **Profile Management**: Customizable user profiles

## 7. Testing the System

### Backend API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Database test
curl http://localhost:5000/api/test-db

# Authentication test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","user_type":"traveler"}'
```

### Frontend Testing
1. Open `http://localhost:4028`
2. Test registration/login flow
3. Test Google OAuth login
4. Test dashboard functionality
5. Test payment integration (with test keys)

## 8. Production Checklist

### Security
- [ ] Change all default passwords and secrets
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Set up proper CORS policies
- [ ] Use production database credentials

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Enable caching where appropriate

### Monitoring
- [ ] Set up error logging
- [ ] Configure health checks
- [ ] Monitor database performance
- [ ] Set up alerts for critical issues

## 9. Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check PostgreSQL is running and credentials are correct
2. **Google OAuth Not Working**: Verify redirect URLs match exactly
3. **Payment Issues**: Ensure API keys are correct and webhooks are configured
4. **CORS Errors**: Check frontend URL is added to CORS whitelist

### Support
- Check logs in `backend/logs/` directory
- Use the test server (`node test-server.js`) to isolate issues
- Verify environment variables are loaded correctly

## 🎉 Deployment Complete!

Your iSafari Global system is now ready for production use with:
- Multi-user authentication and authorization
- Real payment processing capabilities
- Complete booking and service management
- Premium feature monetization
- Scalable architecture for growth

For additional support or customization, refer to the codebase documentation or contact the development team.
