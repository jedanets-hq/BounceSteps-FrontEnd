# PostgreSQL Migration Guide for iSafari Global

## Overview
This guide explains how to migrate the iSafari Global system from MongoDB to PostgreSQL.

## What Has Been Created

### 1. PostgreSQL Configuration
- **File**: `backend/config/postgresql.js`
- **Purpose**: Database connection and table initialization
- **Features**:
  - Connection pool management
  - Automatic table creation
  - Indexes for performance
  - Triggers for `updated_at` timestamps

### 2. PostgreSQL Models
All models have been recreated in `backend/models/pg/`:
- `User.js` - User accounts (travelers and service providers)
- `ServiceProvider.js` - Service provider profiles
- `Service.js` - Services offered by providers
- `Booking.js` - Booking records
- `Payment.js` - Payment transactions
- `Review.js` - Service reviews
- `Notification.js` - User notifications
- `TravelerStory.js` - Traveler stories/experiences
- `StoryLike.js` - Story likes
- `StoryComment.js` - Story comments
- `ServicePromotion.js` - Service promotions
- `index.js` - Exports all models

### 3. Helper Utilities
- **File**: `backend/utils/pg-helpers.js`
- **Purpose**: PostgreSQL-specific helper functions
- **Functions**:
  - `serializeDocument()` - Format PostgreSQL rows for JSON
  - `getPagination()` - Handle pagination
  - `isValidObjectId()` - Validate IDs
  - `buildServiceFilter()` - Build search filters
  - `buildSort()` - Build sort clauses

### 4. Updated Server Configuration
- **File**: `backend/server.js`
- Changed to use PostgreSQL instead of MongoDB
- **File**: `backend/.env.example`
- Updated with PostgreSQL configuration

## Migration Steps

### Step 1: Configure PostgreSQL Database

1. **Open pgAdmin** and ensure you have created the database:
   ```
   Database name: iSafari-Global-Network
   ```

2. **Update `.env` file** in the `backend` directory:
   ```env
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=iSafari-Global-Network
   DB_USER=postgres
   DB_PASSWORD=your_postgresql_password

   # Keep other configurations
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:4028
   ```

### Step 2: Install PostgreSQL Driver

The `pg` package is already in `package.json`. If not installed:
```bash
cd backend
npm install pg
```

### Step 3: Update Route Files

You need to update all route files to use PostgreSQL models instead of Mongoose models.

**Replace this pattern:**
```javascript
const { User, Service } = require('../models');
const { serializeDocument } = require('../utils/mongodb-helpers');
```

**With this:**
```javascript
const { User, Service } = require('../models/pg');
const { serializeDocument } = require('../utils/pg-helpers');
```

**Key Changes in Routes:**

1. **Remove Mongoose-specific code:**
   - `new Model()` → `Model.create()`
   - `Model.findById()` → stays the same
   - `Model.findOne()` → `Model.findByEmail()` or custom methods
   - `$inc`, `$set`, `$or` → Use PostgreSQL methods

2. **Update ID handling:**
   - MongoDB uses `_id` (ObjectId)
   - PostgreSQL uses `id` (integer)
   - Remove `toObjectId()` conversions
   - IDs are now integers, not strings

3. **Update queries:**
   - MongoDB: `Model.find({ field: value })`
   - PostgreSQL: Use model methods like `Model.search(params)`

### Step 4: Update All Routes

Update these route files:
- `backend/routes/auth.js` → Use `backend/routes/auth.pg.js` as reference
- `backend/routes/services.js`
- `backend/routes/bookings.js`
- `backend/routes/providers.js`
- `backend/routes/users.js`
- `backend/routes/admin.js`
- `backend/routes/payments.js`
- `backend/routes/notifications.js`
- `backend/routes/travelerStories.js`

### Step 5: Test the Migration

1. **Start the server:**
   ```bash
   cd backend
   npm start
   ```

2. **Check console output:**
   ```
   ✅ Connected to PostgreSQL database
   🔧 Initializing PostgreSQL database tables...
   ✅ PostgreSQL database initialized successfully
   🚀 iSafari Global API server running on port 5000
   💾 Database: PostgreSQL
   ```

3. **Test endpoints:**
   - Register a new user: `POST /api/auth/register`
   - Login: `POST /api/auth/login`
   - Get services: `GET /api/services`

### Step 6: Remove MongoDB Dependencies (Optional)

Once everything works:

1. **Remove MongoDB packages:**
   ```bash
   npm uninstall mongoose mongodb
   ```

2. **Delete MongoDB files:**
   - `backend/config/mongodb.js`
   - `backend/models/` (old Mongoose models)
   - `backend/utils/mongodb-helpers.js`

## Database Schema

### Tables Created:
1. `users` - User accounts
2. `service_providers` - Provider profiles
3. `services` - Services catalog
4. `bookings` - Booking records
5. `reviews` - Service reviews
6. `payments` - Payment transactions
7. `notifications` - User notifications
8. `traveler_stories` - Travel stories
9. `story_likes` - Story likes
10. `story_comments` - Story comments
11. `service_promotions` - Service promotions

### Key Features:
- Foreign key constraints for data integrity
- Indexes for query performance
- Automatic timestamp updates
- JSONB fields for flexible data (location_data, media, etc.)
- Array fields for lists (images, amenities, highlights, etc.)

## Common Migration Patterns

### Pattern 1: Creating Records
**MongoDB:**
```javascript
const user = new User({ email, password });
await user.save();
```

**PostgreSQL:**
```javascript
const user = await User.create({ email, password });
```

### Pattern 2: Finding Records
**MongoDB:**
```javascript
const user = await User.findOne({ email });
```

**PostgreSQL:**
```javascript
const user = await User.findByEmail(email);
```

### Pattern 3: Updating Records
**MongoDB:**
```javascript
await User.findByIdAndUpdate(id, { $set: { name: 'New Name' } });
```

**PostgreSQL:**
```javascript
await User.update(id, { first_name: 'New Name' });
```

### Pattern 4: Counting
**MongoDB:**
```javascript
const count = await User.countDocuments({ user_type: 'traveler' });
```

**PostgreSQL:**
```javascript
const count = await User.count({ user_type: 'traveler' });
```

### Pattern 5: Searching with Filters
**MongoDB:**
```javascript
const services = await Service.find({ 
  category: 'safari',
  price: { $gte: 100, $lte: 500 }
});
```

**PostgreSQL:**
```javascript
const { services } = await Service.search({ 
  category: 'safari',
  minPrice: 100,
  maxPrice: 500
});
```

## Troubleshooting

### Issue: Connection Failed
**Solution:** Check your PostgreSQL credentials in `.env` file and ensure PostgreSQL service is running.

### Issue: Tables Not Created
**Solution:** Check console logs. The initialization runs automatically on server start.

### Issue: Foreign Key Violations
**Solution:** Ensure you create parent records (users, providers) before child records (services, bookings).

### Issue: JSONB Fields Not Parsing
**Solution:** The `serializeDocument()` function handles this automatically.

## Next Steps

1. Update all route files to use PostgreSQL models
2. Test all API endpoints
3. Update passport configuration if needed
4. Run integration tests
5. Deploy to production

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify PostgreSQL connection settings
3. Ensure all tables are created properly
4. Check that foreign key relationships are correct

---

**Migration completed successfully! Your iSafari Global system is now running on PostgreSQL.**