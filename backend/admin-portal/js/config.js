/**
 * iSafari Admin Portal - Configuration
 * Connects to iSafari backend API
 */

export const CONFIG = {
    // API Configuration - Connect to iSafari Backend (Production - Render)
    API_BASE_URL: 'https://isafarinetworkglobal-2.onrender.com/api',

    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            VERIFY: '/auth/verify',
            REFRESH: '/auth/refresh'
        },

        // Users
        USERS: {
            ALL: '/admin/users',
            BY_ID: (id) => `/admin/users/${id}`,
            TRAVELERS: '/admin/users?role=traveler',
            PROVIDERS: '/admin/users?role=service_provider',
            VERIFY: (id) => `/admin/users/${id}/verify`,
            SUSPEND: (id) => `/admin/users/${id}/suspend`,
            DELETE: (id) => `/admin/users/${id}`,
            STATS: '/admin/users/stats',
            UPDATE_STATUS: (id) => `/admin/users/${id}/status`
        },

        // Services
        SERVICES: {
            ALL: '/admin/services',
            BY_ID: (id) => `/admin/services/${id}`,
            PENDING: '/admin/services?status=pending',
            APPROVE: (id) => `/admin/services/${id}/approve`,
            REJECT: (id) => `/admin/services/${id}/reject`,
            DELETE: (id) => `/admin/services/${id}`,
            STATS: '/admin/services/stats',
            CATEGORIES: '/admin/categories',
            DESTINATIONS: '/admin/destinations'
        },

        // Bookings
        BOOKINGS: {
            ALL: '/admin/bookings',
            BY_ID: (id) => `/admin/bookings/${id}`,
            PRE_ORDERS: '/admin/pre-orders',
            STATS: '/admin/bookings/stats',
            CALENDAR: '/admin/bookings/calendar',
            CANCEL: (id) => `/admin/bookings/${id}/cancel`,
            REFUND: (id) => `/admin/bookings/${id}/refund`
        },

        // Payments
        PAYMENTS: {
            ALL: '/admin/payments',
            BY_ID: (id) => `/admin/payments/${id}`,
            TRANSACTIONS: '/admin/transactions',
            REVENUE: '/admin/revenue',
            PAYOUTS: '/admin/payouts',
            PENDING_PAYOUTS: '/admin/payouts/pending',
            PROCESS_PAYOUT: (id) => `/admin/payouts/${id}/process`,
            STATS: '/admin/payments/stats'
        },

        // Reviews & Feedback
        REVIEWS: {
            ALL: '/admin/reviews',
            BY_ID: (id) => `/admin/reviews/${id}`,
            PENDING: '/admin/reviews/pending',
            APPROVE: (id) => `/admin/reviews/${id}/approve`,
            DELETE: (id) => `/admin/reviews/${id}`,
            FEEDBACK: '/admin/feedback'
        },

        // Support
        SUPPORT: {
            TICKETS: '/admin/support/tickets',
            BY_ID: (id) => `/admin/support/tickets/${id}`,
            REPLY: (id) => `/admin/support/tickets/${id}/reply`,
            CLOSE: (id) => `/admin/support/tickets/${id}/close`,
            REPORTS: '/admin/reports',
            RESOLVE_REPORT: (id) => `/admin/reports/${id}/resolve`
        },

        // Content
        CONTENT: {
            PROMOTIONS: '/admin/promotions',
            CREATE_PROMOTION: '/admin/promotions/create',
            DELETE_PROMOTION: (id) => `/admin/promotions/${id}`,
            NOTIFICATIONS: '/admin/notifications',
            SEND_NOTIFICATION: '/admin/notifications/send'
        },

        // Analytics
        ANALYTICS: {
            DASHBOARD: '/admin/analytics/dashboard',
            USERS: '/admin/analytics/users',
            SERVICES: '/admin/analytics/services',
            BOOKINGS: '/admin/analytics/bookings',
            REVENUE: '/admin/analytics/revenue',
            TRENDS: '/admin/analytics/trends'
        },

        // Activity Logs
        LOGS: {
            ALL: '/admin/logs',
            BY_USER: (userId) => `/admin/logs/user/${userId}`,
            BY_ACTION: (action) => `/admin/logs/action/${action}`,
            SYSTEM: '/admin/logs/system'
        },

        // Settings
        SETTINGS: {
            GET: '/admin/settings',
            UPDATE: '/admin/settings',
            ADMINS: '/admin/settings/admins',
            ADD_ADMIN: '/admin/settings/admins/add',
            REMOVE_ADMIN: (id) => `/admin/settings/admins/${id}`,
            SYSTEM_HEALTH: '/admin/system/health'
        }
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // Status Options
    STATUS: {
        USERS: ['active', 'suspended', 'pending', 'deleted'],
        SERVICES: ['pending', 'approved', 'rejected', 'inactive'],
        BOOKINGS: ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'],
        PAYMENTS: ['pending', 'completed', 'failed', 'refunded'],
        TICKETS: ['open', 'in-progress', 'resolved', 'closed']
    },

    // User Roles
    ROLES: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        MODERATOR: 'moderator',
        SUPPORT: 'support'
    },

    // Service Categories (matching frontend - journey-planner, destination-discovery)
    CATEGORIES: [
        { id: 'Accommodation', name: 'Accommodation', icon: 'fa-hotel' },
        { id: 'Transportation', name: 'Transportation', icon: 'fa-car' },
        { id: 'Tours & Activities', name: 'Tours & Activities', icon: 'fa-hiking' },
        { id: 'Food & Dining', name: 'Food & Dining', icon: 'fa-utensils' },
        { id: 'Shopping', name: 'Shopping', icon: 'fa-shopping-bag' },
        { id: 'Health & Wellness', name: 'Health & Wellness', icon: 'fa-heart' },
        { id: 'Entertainment', name: 'Entertainment', icon: 'fa-music' }
    ],

    // Chart Colors (iSafari Theme)
    CHART_COLORS: {
        primary: '#2C5F41',
        secondary: '#4A90A4',
        accent: '#D4A574',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#3B82F6',
        gradient: {
            primary: ['#2C5F41', '#3A7A56'],
            secondary: ['#4A90A4', '#5BA5BA'],
            accent: ['#D4A574', '#E0B88A']
        }
    },

    // Date Formats
    DATE_FORMATS: {
        DISPLAY: 'MMM DD, YYYY',
        DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
        API: 'YYYY-MM-DD',
        API_TIME: 'YYYY-MM-DD HH:mm:ss'
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'isafari_admin_token',
        USER_DATA: 'isafari_admin_user',
        THEME: 'isafari_admin_theme',
        SIDEBAR_STATE: 'isafari_admin_sidebar'
    },

    // Refresh Intervals (in milliseconds)
    REFRESH_INTERVALS: {
        DASHBOARD: 30000, // 30 seconds
        NOTIFICATIONS: 60000, // 1 minute
        SYSTEM_HEALTH: 120000 // 2 minutes
    },

    // File Upload
    UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
    },

    // Notification Types
    NOTIFICATION_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    // Activity Log Actions
    LOG_ACTIONS: {
        USER_CREATED: 'user_created',
        USER_UPDATED: 'user_updated',
        USER_DELETED: 'user_deleted',
        USER_VERIFIED: 'user_verified',
        USER_SUSPENDED: 'user_suspended',
        SERVICE_CREATED: 'service_created',
        SERVICE_APPROVED: 'service_approved',
        SERVICE_REJECTED: 'service_rejected',
        SERVICE_DELETED: 'service_deleted',
        BOOKING_CREATED: 'booking_created',
        BOOKING_CANCELLED: 'booking_cancelled',
        PAYMENT_PROCESSED: 'payment_processed',
        PAYOUT_PROCESSED: 'payout_processed',
        SETTINGS_UPDATED: 'settings_updated'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
