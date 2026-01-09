/**
 * iSafari Admin Portal - Utility Functions
 */

import { CONFIG } from './config.js';

export const Utils = {
    /**
     * Format date to readable string
     */
    formatDate(date, includeTime = false) {
        if (!date) return '-';

        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return d.toLocaleDateString('en-US', options);
    },

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'TZS') {
        if (amount === null || amount === undefined) return '-';

        const formatted = new Intl.NumberFormat('en-TZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);

        return formatted;
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('en-US');
    },

    /**
     * Truncate text
     */
    truncate(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    /**
     * Get time ago string
     */
    timeAgo(date) {
        if (!date) return '-';

        const now = new Date();
        const past = new Date(date);
        const seconds = Math.floor((now - past) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const statusMap = {
            // User statuses
            'active': { class: 'success', icon: 'check-circle', text: 'Active' },
            'suspended': { class: 'danger', icon: 'ban', text: 'Suspended' },
            'pending': { class: 'warning', icon: 'clock', text: 'Pending' },
            'deleted': { class: 'muted', icon: 'trash', text: 'Deleted' },

            // Service statuses
            'approved': { class: 'success', icon: 'check-circle', text: 'Approved' },
            'rejected': { class: 'danger', icon: 'times-circle', text: 'Rejected' },
            'inactive': { class: 'muted', icon: 'pause-circle', text: 'Inactive' },

            // Booking statuses
            'confirmed': { class: 'success', icon: 'check', text: 'Confirmed' },
            'completed': { class: 'info', icon: 'check-double', text: 'Completed' },
            'cancelled': { class: 'danger', icon: 'times', text: 'Cancelled' },
            'refunded': { class: 'warning', icon: 'undo', text: 'Refunded' },

            // Payment statuses
            'paid': { class: 'success', icon: 'check', text: 'Paid' },
            'failed': { class: 'danger', icon: 'times', text: 'Failed' },
            'processing': { class: 'info', icon: 'spinner', text: 'Processing' },

            // Ticket statuses
            'open': { class: 'warning', icon: 'envelope-open', text: 'Open' },
            'in-progress': { class: 'info', icon: 'tasks', text: 'In Progress' },
            'resolved': { class: 'success', icon: 'check', text: 'Resolved' },
            'closed': { class: 'muted', icon: 'times', text: 'Closed' }
        };

        const config = statusMap[status?.toLowerCase()] || { class: 'muted', icon: 'question', text: status };

        return `
            <span class="badge badge-${config.class}">
                <i class="fas fa-${config.icon}"></i>
                ${config.text}
            </span>
        `;
    },

    /**
     * Get user role badge
     */
    getRoleBadge(role) {
        const roleMap = {
            'traveler': { class: 'primary', icon: 'user', text: 'Traveler' },
            'service_provider': { class: 'secondary', icon: 'briefcase', text: 'Provider' },
            'admin': { class: 'danger', icon: 'user-shield', text: 'Admin' },
            'super_admin': { class: 'danger', icon: 'crown', text: 'Super Admin' }
        };

        const config = roleMap[role] || { class: 'muted', icon: 'user', text: role };

        return `
            <span class="badge badge-${config.class}">
                <i class="fas fa-${config.icon}"></i>
                ${config.text}
            </span>
        `;
    },

    /**
     * Get auth provider badge HTML
     */
    getAuthProviderBadge(authProvider) {
        const providerMap = {
            'google': { class: 'info', icon: 'fab fa-google', text: 'Google' },
            'email': { class: 'secondary', icon: 'fas fa-envelope', text: 'Email' },
            'both': { class: 'warning', icon: 'fas fa-link', text: 'Both' }
        };

        const config = providerMap[authProvider] || providerMap['email'];

        return `
            <span class="badge badge-${config.class}">
                <i class="${config.icon}"></i>
                ${config.text}
            </span>
        `;
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${iconMap[type]}"></i>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.2s ease-out';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    },

    /**
     * Show confirmation modal
     */
    showConfirm(title, message, onConfirm, onCancel = null) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal confirm-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline cancel-btn">Cancel</button>
                    <button class="btn btn-primary confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        modalContainer.appendChild(modal);

        // Close handlers
        const closeModal = () => {
            modal.remove();
            if (onCancel) onCancel();
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
        modal.querySelector('.confirm-btn').addEventListener('click', () => {
            modal.remove();
            onConfirm();
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard', 'success');
        } catch (err) {
            this.showToast('Failed to copy', 'error');
        }
    },

    /**
     * Download data as CSV
     */
    downloadCSV(data, filename) {
        if (!data || data.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showToast('CSV downloaded successfully', 'success');
    },

    /**
     * Validate email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate phone number
     */
    isValidPhone(phone) {
        const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return re.test(phone);
    },

    /**
     * Generate random ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    },

    /**
     * Get percentage change
     */
    getPercentageChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    },

    /**
     * Get trend indicator HTML
     */
    getTrendIndicator(current, previous) {
        const change = this.getPercentageChange(current, previous);
        const isPositive = change > 0;
        const isNegative = change < 0;

        if (change === 0) {
            return `<span class="trend-neutral"><i class="fas fa-minus"></i> 0%</span>`;
        }

        return `
            <span class="trend-${isPositive ? 'up' : 'down'}">
                <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
                ${Math.abs(change)}%
            </span>
        `;
    },

    /**
     * Parse query parameters
     */
    parseQueryParams(url = window.location.search) {
        const params = new URLSearchParams(url);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Build query string
     */
    buildQueryString(params) {
        return new URLSearchParams(params).toString();
    },

    /**
     * Sanitize HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Get file size string
     */
    getFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Check if user has permission
     */
    hasPermission(requiredRole) {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        if (!userData) return false;

        const user = JSON.parse(userData);
        const roleHierarchy = {
            'super_admin': 4,
            'admin': 3,
            'moderator': 2,
            'support': 1
        };

        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },

    /**
     * Format phone number
     */
    formatPhone(phone) {
        if (!phone) return '-';

        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '');

        // Format as +255 XXX XXX XXX
        if (cleaned.startsWith('255')) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        }

        return phone;
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';

        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    /**
     * Get avatar URL
     */
    getAvatarUrl(name, imageUrl = null) {
        if (imageUrl) return imageUrl;

        const initials = this.getInitials(name);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2C5F41&color=fff&size=128`;
    }
};
