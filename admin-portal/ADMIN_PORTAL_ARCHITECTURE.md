# 🏛️ iSafari Admin Portal - Complete Architecture

## 📋 Executive Summary

The iSafari Admin Portal is a **fully independent, standalone web application** designed to manage and control the entire iSafari ecosystem (Traveller & Service Provider platforms) without disrupting existing functionality.

### Core Principles
- **Complete Independence**: Separate codebase, build, and deployment
- **API-First Communication**: Zero direct code coupling with main apps
- **Shared Backend Strategy**: Leverages existing backend with strict role-based authorization
- **Security-First Design**: Multi-layer authentication and authorization
- **International Standards**: Follows industry best practices for admin systems

---

## 🏗️ System Architecture Overview

### Architecture Decision: Shared Backend with Admin Authorization

**Strategy**: Use the existing backend with enhanced admin-specific routes and middleware

**Rationale**:
1. **Data Consistency**: Single source of truth for all system data
2. **Reduced Complexity**: No data synchronization between backends
3. **Cost Efficiency**: Single database, single deployment
4. **Faster Development**: Leverage existing models and infrastructure
5. **Easier Maintenance**: One codebase for business logic

**Security Implementation**:
- Dedicated admin authentication middleware
- Role-based access control (RBAC) at route level
- Admin-specific JWT tokens with elevated permissions
- Audit logging for all admin actions
- IP whitelisting capability (optional)

---

## 📁 Project Structure

```
admin-portal/
├── public/
│   ├── index.html
│   └── admin-logo.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── DataTable.jsx
│   │   │   └── Modal.jsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── RevenueChart.jsx
│   │   │   └── ActivityFeed.jsx
│   │   ├── users/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserDetails.jsx
│   │   │   ├── UserActions.jsx
│   │   │   └── UserFilters.jsx
│   │   ├── providers/
│   │   │   ├── ProviderList.jsx
│   │   │   ├── ProviderDetails.jsx
│   │   │   ├── VerificationPanel.jsx
│   │   │   └── BadgeManager.jsx
│   │   ├── payments/
│   │   │   ├── TransactionList.jsx
│   │   │   ├── PaymentDetails.jsx
│   │   │   ├── RefundManager.jsx
│   │   │   └── FinancialReports.jsx
│   │   └── verification/
│   │       ├── VerificationQueue.jsx
│   │       ├── DocumentViewer.jsx
│   │       └── BadgeAssignment.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Providers.jsx
│   │   ├── Payments.jsx
│   │   ├── Verification.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   └── Login.jsx
│   ├── contexts/
│   │   ├── AdminAuthContext.jsx
│   │   └── AdminThemeContext.jsx
│   ├── hooks/
│   │   ├── useAdminAuth.js
│   │   ├── useUsers.js
│   │   ├── useProviders.js
│   │   └── usePayments.js
│   ├── services/
│   │   ├── adminApi.js
│   │   ├── userService.js
│   │   ├── providerService.js
│   │   └── paymentService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── styles/
│   │   └── admin.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔐 Authentication & Authorization System

### Admin User Types & Permissions

```javascript
const ADMIN_ROLES = {
  SUPER_ADMIN: {
    level: 1,
    permissions: ['*'], // All permissions
    description: 'Full system access'
  },
  ADMIN: {
    level: 2,
    permissions: [
      'users.view', 'users.edit', 'users.suspend',
      'providers.view', 'providers.verify', 'providers.badge',
      'payments.view', 'payments.refund',
      'reports.view'
    ],
    description: 'Standard admin access'
  },
  MODERATOR: {
    level: 3,
    permissions: [
      'users.view',
      'providers.view', 'providers.verify',
      'reports.view'
    ],
    description: 'Limited moderation access'
  },
  FINANCE_ADMIN: {
    level: 2,
    permissions: [
      'payments.view', 'payments.edit', 'payments.refund',
      'reports.view', 'reports.financial'
    ],
    description: 'Financial operations only'
  }
};
```

### Authentication Flow

1. **Admin Login** → Separate admin login endpoint
2. **JWT Token** → Contains admin role and permissions
3. **Token Validation** → Every request validates admin token
4. **Permission Check** → Route-level permission verification
5. **Audit Log** → All actions logged with admin ID and timestamp

---

## 🗄️ Database Schema Extensions

### New Tables for Admin Portal

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- ADMIN USERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'finance_admin')),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ADMIN AUDIT LOG TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PROVIDER BADGES TABLE (Single Badge System)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE provider_badges (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE UNIQUE,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('verified', 'premium', 'top_rated', 'eco_friendly', 'local_expert')),
    assigned_by INTEGER REFERENCES admin_users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT one_badge_per_provider UNIQUE(provider_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION REQUESTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE verification_requests (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES service_providers(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('identity', 'business', 'badge')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    documents JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES admin_users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    notes TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENTS TABLE (Enhanced)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    provider_id INTEGER REFERENCES service_providers(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TZS',
    platform_commission DECIMAL(10,2),
    provider_payout DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refunded_by INTEGER REFERENCES admin_users(id),
    refunded_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SYSTEM SETTINGS TABLE
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by INTEGER REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);
CREATE INDEX idx_provider_badges_provider ON provider_badges(provider_id);
CREATE INDEX idx_verification_requests_provider ON verification_requests(provider_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 🎯 Core Features & Implementation

### 1. User Management

**Capabilities**:
- View all users (travelers & providers) with advanced filtering
- Search by email, name, phone, registration date
- View detailed user profile and activity history
- Account status management:
  - ✅ Activate
  - ⏸️ Suspend (temporary)
  - 🚫 Ban (permanent)
  - ♻️ Restore
- Edit user information
- View user's bookings, payments, and stories
- Export user data (GDPR compliance)

**API Endpoints**:
```javascript
GET    /api/admin/users              // List all users
GET    /api/admin/users/:id          // Get user details
PUT    /api/admin/users/:id          // Update user
POST   /api/admin/users/:id/suspend  // Suspend user
POST   /api/admin/users/:id/ban      // Ban user
POST   /api/admin/users/:id/restore  // Restore user
GET    /api/admin/users/:id/activity // User activity log
```

### 2. Service Provider Management

**Capabilities**:
- View all service providers with filtering
- Provider verification workflow
- Badge management (single badge system)
- View provider services and bookings
- Performance analytics per provider
- Commission management

**Badge System Rules**:
