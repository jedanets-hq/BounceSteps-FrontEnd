import { CONFIG } from './config.js';

/**
 * API Service Class
 * Handles all API communications with the backend
 */
class API {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = this.getToken();
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        this.token = token;
    }

    /**
     * Remove authentication token
     */
    removeToken() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        this.token = null;
    }

    /**
     * Get default headers for API requests
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log('API Request:', url);
        
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.auth !== false),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            console.log('API Response status:', response.status);
            
            const data = await response.json();
            console.log('API Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            console.error('API Error details:', {
                url,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ==========================================
    // Authentication APIs
    // ==========================================

    async login(email, password) {
        const data = await this.post(CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password });
        if (data.token) {
            this.setToken(data.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
        }
        return data;
    }

    async logout() {
        try {
            await this.post(CONFIG.ENDPOINTS.AUTH.LOGOUT);
        } finally {
            this.removeToken();
        }
    }

    async verifyAuth() {
        return this.get(CONFIG.ENDPOINTS.AUTH.VERIFY);
    }

    // ==========================================
    // User Management APIs
    // ==========================================

    async getAllUsers(params = {}) {
        return this.get(CONFIG.ENDPOINTS.USERS.ALL, params);
    }

    async getUserById(id) {
        return this.get(CONFIG.ENDPOINTS.USERS.BY_ID(id));
    }

    async getTravelers(params = {}) {
        return this.get(CONFIG.ENDPOINTS.USERS.TRAVELERS, params);
    }

    async getProviders(params = {}) {
        return this.get(CONFIG.ENDPOINTS.USERS.PROVIDERS, params);
    }

    async verifyUser(id) {
        return this.post(CONFIG.ENDPOINTS.USERS.VERIFY(id));
    }

    async suspendUser(id, reason) {
        return this.post(CONFIG.ENDPOINTS.USERS.SUSPEND(id), { reason });
    }

    async deleteUser(id) {
        return this.delete(CONFIG.ENDPOINTS.USERS.DELETE(id));
    }

    async getUserStats() {
        return this.get(CONFIG.ENDPOINTS.USERS.STATS);
    }

    // ==========================================
    // Service Management APIs
    // ==========================================

    async getAllServices(params = {}) {
        return this.get(CONFIG.ENDPOINTS.SERVICES.ALL, params);
    }

    async getServiceById(id) {
        return this.get(CONFIG.ENDPOINTS.SERVICES.BY_ID(id));
    }

    async getPendingServices(params = {}) {
        return this.get(CONFIG.ENDPOINTS.SERVICES.PENDING, params);
    }

    async approveService(id) {
        return this.post(CONFIG.ENDPOINTS.SERVICES.APPROVE(id));
    }

    async rejectService(id, reason) {
        return this.post(CONFIG.ENDPOINTS.SERVICES.REJECT(id), { reason });
    }

    async deleteService(id) {
        return this.delete(CONFIG.ENDPOINTS.SERVICES.DELETE(id));
    }

    async getServiceStats() {
        return this.get(CONFIG.ENDPOINTS.SERVICES.STATS);
    }

    async getCategories() {
        return this.get(CONFIG.ENDPOINTS.SERVICES.CATEGORIES);
    }

    async getDestinations() {
        return this.get(CONFIG.ENDPOINTS.SERVICES.DESTINATIONS);
    }

    // ==========================================
    // Booking Management APIs
    // ==========================================

    async getAllBookings(params = {}) {
        return this.get(CONFIG.ENDPOINTS.BOOKINGS.ALL, params);
    }

    async getBookingById(id) {
        return this.get(CONFIG.ENDPOINTS.BOOKINGS.BY_ID(id));
    }

    async getPreOrders(params = {}) {
        return this.get(CONFIG.ENDPOINTS.BOOKINGS.PRE_ORDERS, params);
    }

    async getBookingStats() {
        return this.get(CONFIG.ENDPOINTS.BOOKINGS.STATS);
    }

    async getBookingCalendar(params = {}) {
        return this.get(CONFIG.ENDPOINTS.BOOKINGS.CALENDAR, params);
    }

    async cancelBooking(id, reason) {
        return this.post(CONFIG.ENDPOINTS.BOOKINGS.CANCEL(id), { reason });
    }

    async refundBooking(id, amount) {
        return this.post(CONFIG.ENDPOINTS.BOOKINGS.REFUND(id), { amount });
    }

    // ==========================================
    // Payment Management APIs
    // ==========================================

    async getAllPayments(params = {}) {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.ALL, params);
    }

    async getPaymentById(id) {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.BY_ID(id));
    }

    async getTransactions(params = {}) {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.TRANSACTIONS, params);
    }

    async getRevenue(params = {}) {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.REVENUE, params);
    }

    async getPayouts(params = {}) {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.PAYOUTS, params);
    }

    async getPendingPayouts() {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.PENDING_PAYOUTS);
    }

    async processPayout(id) {
        return this.post(CONFIG.ENDPOINTS.PAYMENTS.PROCESS_PAYOUT(id));
    }

    async getPaymentStats() {
        return this.get(CONFIG.ENDPOINTS.PAYMENTS.STATS);
    }

    // ==========================================
    // Review & Feedback APIs
    // ==========================================

    async getAllReviews(params = {}) {
        return this.get(CONFIG.ENDPOINTS.REVIEWS.ALL, params);
    }

    async getReviewById(id) {
        return this.get(CONFIG.ENDPOINTS.REVIEWS.BY_ID(id));
    }

    async getPendingReviews() {
        return this.get(CONFIG.ENDPOINTS.REVIEWS.PENDING);
    }

    async approveReview(id) {
        return this.post(CONFIG.ENDPOINTS.REVIEWS.APPROVE(id));
    }

    async deleteReview(id) {
        return this.delete(CONFIG.ENDPOINTS.REVIEWS.DELETE(id));
    }

    async getFeedback(params = {}) {
        return this.get(CONFIG.ENDPOINTS.REVIEWS.FEEDBACK, params);
    }

    // ==========================================
    // Support APIs
    // ==========================================

    async getSupportTickets(params = {}) {
        return this.get(CONFIG.ENDPOINTS.SUPPORT.TICKETS, params);
    }

    async getTicketById(id) {
        return this.get(CONFIG.ENDPOINTS.SUPPORT.BY_ID(id));
    }

    async replyToTicket(id, message) {
        return this.post(CONFIG.ENDPOINTS.SUPPORT.REPLY(id), { message });
    }

    async closeTicket(id) {
        return this.post(CONFIG.ENDPOINTS.SUPPORT.CLOSE(id));
    }

    async getReports(params = {}) {
        return this.get(CONFIG.ENDPOINTS.SUPPORT.REPORTS, params);
    }

    async resolveReport(id, action) {
        return this.post(CONFIG.ENDPOINTS.SUPPORT.RESOLVE_REPORT(id), { action });
    }

    // ==========================================
    // Content Management APIs
    // ==========================================

    async getPromotions(params = {}) {
        return this.get(CONFIG.ENDPOINTS.CONTENT.PROMOTIONS, params);
    }

    async createPromotion(data) {
        return this.post(CONFIG.ENDPOINTS.CONTENT.CREATE_PROMOTION, data);
    }

    async deletePromotion(id) {
        return this.delete(CONFIG.ENDPOINTS.CONTENT.DELETE_PROMOTION(id));
    }

    async getNotifications(params = {}) {
        return this.get(CONFIG.ENDPOINTS.CONTENT.NOTIFICATIONS, params);
    }

    async sendNotification(data) {
        return this.post(CONFIG.ENDPOINTS.CONTENT.SEND_NOTIFICATION, data);
    }

    // ==========================================
    // Analytics APIs
    // ==========================================

    async getDashboardAnalytics(params = {}) {
        return this.get(CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD, params);
    }

    async getUserAnalytics(params = {}) {
        return this.get(CONFIG.ENDPOINTS.ANALYTICS.USERS, params);
    }

    async getServiceAnalytics(params = {}) {
        return this.get(CONFIG.ENDPOINTS.ANALYTICS.SERVICES, params);
    }

    async getBookingAnalytics(params = {}) {
        return this.get(CONFIG.ENDPOINTS.ANALYTICS.BOOKINGS, params);
    }

    async getRevenueAnalytics(params = {}) {
        return this.get(CONFIG.ENDPOINTS.ANALYTICS.REVENUE, params);
    }

    async getTrends(params = {}) {
        return this.get(CONFIG.ENDPOINTS.ANALYTICS.TRENDS, params);
    }

    // ==========================================
    // Activity Logs APIs
    // ==========================================

    async getActivityLogs(params = {}) {
        return this.get(CONFIG.ENDPOINTS.LOGS.ALL, params);
    }

    async getUserLogs(userId, params = {}) {
        return this.get(CONFIG.ENDPOINTS.LOGS.BY_USER(userId), params);
    }

    async getActionLogs(action, params = {}) {
        return this.get(CONFIG.ENDPOINTS.LOGS.BY_ACTION(action), params);
    }

    async getSystemLogs(params = {}) {
        return this.get(CONFIG.ENDPOINTS.LOGS.SYSTEM, params);
    }

    // ==========================================
    // Settings APIs
    // ==========================================

    async getSettings() {
        return this.get(CONFIG.ENDPOINTS.SETTINGS.GET);
    }

    async updateSettings(data) {
        return this.put(CONFIG.ENDPOINTS.SETTINGS.UPDATE, data);
    }

    async getAdmins() {
        return this.get(CONFIG.ENDPOINTS.SETTINGS.ADMINS);
    }

    async addAdmin(data) {
        return this.post(CONFIG.ENDPOINTS.SETTINGS.ADD_ADMIN, data);
    }

    async removeAdmin(id) {
        return this.delete(CONFIG.ENDPOINTS.SETTINGS.REMOVE_ADMIN(id));
    }

    async getSystemHealth() {
        return this.get(CONFIG.ENDPOINTS.SETTINGS.SYSTEM_HEALTH);
    }
}

// Create global API instance
const api = new API();

// Export for ES modules
export { API, api };
