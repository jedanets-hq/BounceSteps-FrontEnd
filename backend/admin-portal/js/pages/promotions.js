import { Components } from '../components.js';
import { Utils } from '../utils.js';
import { CONFIG } from '../config.js';

export const PromotionsPage = {
    promotions: [],
    stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
    currentFilter: 'all',

    async init() {
        await this.loadPromotions();
    },

    async loadPromotions() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading promotions...');

            const response = await fetch(`${CONFIG.API_BASE_URL}/admin/promotions`);
            const data = await response.json();

            if (data.success) {
                this.promotions = data.promotions || [];
                this.stats = data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
            }

            this.renderPromotions();
        } catch (error) {
            console.error('Error loading promotions:', error);
            Utils.showToast('Failed to load promotions', 'error');
            this.renderPromotions();
        }
    },

    renderPromotions() {
        const pageContent = document.getElementById('pageContent');
        const filteredPromotions = this.currentFilter === 'all' 
            ? this.promotions 
            : this.promotions.filter(p => p.status === this.currentFilter);

        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title"><i class="fas fa-bullhorn"></i> Promotion Requests</h1>
                    <p class="page-subtitle">Manage service promotion requests from providers</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-list"></i></div>
                    <div class="stat-value">${this.stats.total}</div>
                    <div class="stat-label">Total Requests</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-value">${this.stats.pending}</div>
                    <div class="stat-label">Pending Review</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-value">${this.stats.approved}</div>
                    <div class="stat-label">Approved</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; padding: 20px; border-radius: 12px;">
                    <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                    <div class="stat-value">${this.stats.rejected}</div>
                    <div class="stat-label">Rejected</div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn ${this.currentFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="PromotionsPage.filterPromotions('all')">
                    All (${this.stats.total})
                </button>
                <button class="btn ${this.currentFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}" onclick="PromotionsPage.filterPromotions('pending')">
                    <i class="fas fa-clock"></i> Pending (${this.stats.pending})
                </button>
                <button class="btn ${this.currentFilter === 'approved' ? 'btn-primary' : 'btn-secondary'}" onclick="PromotionsPage.filterPromotions('approved')">
                    <i class="fas fa-check"></i> Approved (${this.stats.approved})
                </button>
                <button class="btn ${this.currentFilter === 'rejected' ? 'btn-primary' : 'btn-secondary'}" onclick="PromotionsPage.filterPromotions('rejected')">
                    <i class="fas fa-times"></i> Rejected (${this.stats.rejected})
                </button>
            </div>

            <!-- Promotions List -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Promotion Requests</h3>
                </div>
                <div class="card-body">
                    ${filteredPromotions.length === 0 ? `
                        <div class="empty-state" style="text-align: center; padding: 40px;">
                            <i class="fas fa-bullhorn" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                            <h3>No Promotion Requests</h3>
                            <p>No promotion requests found for the selected filter.</p>
                        </div>
                    ` : `
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Provider</th>
                                        <th>Promotion Type</th>
                                        <th>Location</th>
                                        <th>Amount</th>
                                        <th>Payment Status</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredPromotions.map(promo => `
                                        <tr>
                                            <td>
                                                <strong>${promo.service_title || 'N/A'}</strong>
                                                <br><small class="text-muted">${promo.service_category || ''}</small>
                                            </td>
                                            <td>
                                                ${promo.provider_name || 'N/A'}
                                                <br><small class="text-muted">${promo.provider_email || ''}</small>
                                            </td>
                                            <td>
                                                <span class="badge ${this.getPromotionTypeBadge(promo.promotion_type)}">
                                                    ${this.formatPromotionType(promo.promotion_type)}
                                                </span>
                                            </td>
                                            <td>${this.formatLocation(promo.promotion_location)}</td>
                                            <td>
                                                <strong>TZS ${(promo.cost || 0).toLocaleString()}</strong>
                                            </td>
                                            <td>
                                                <span class="badge ${promo.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}">
                                                    ${promo.payment_status || 'pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge ${this.getStatusBadge(promo.status)}">
                                                    ${promo.status || 'pending'}
                                                </span>
                                            </td>
                                            <td>${Utils.formatDate(promo.created_at)}</td>
                                            <td>
                                                ${promo.status === 'pending' ? `
                                                    <div class="btn-group">
                                                        <button class="btn btn-sm btn-success" onclick="PromotionsPage.approvePromotion(${promo.id})" title="Approve">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-danger" onclick="PromotionsPage.rejectPromotion(${promo.id})" title="Reject">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                ` : `
                                                    <button class="btn btn-sm btn-secondary" onclick="PromotionsPage.viewDetails(${promo.id})" title="View Details">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                `}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    getPromotionTypeBadge(type) {
        const badges = {
            'featured': 'badge-purple',
            'trending': 'badge-orange',
            'search_boost': 'badge-blue'
        };
        return badges[type] || 'badge-secondary';
    },

    formatPromotionType(type) {
        const types = {
            'featured': 'Featured Carousel',
            'trending': 'Trending Services',
            'search_boost': 'Search Boost'
        };
        return types[type] || type;
    },

    formatLocation(location) {
        const locations = {
            'top_carousel': 'Top Carousel',
            'max_visibility': 'Max Visibility',
            'premium_badge': 'Premium Badge',
            'homepage_slides': 'Homepage Slides',
            'trending_section': 'Trending Section',
            'increased_visibility': 'Increased Visibility',
            'search_priority': 'Search Priority',
            'top_search': 'Top Search',
            'category_priority': 'Category Priority',
            'enhanced_listing': 'Enhanced Listing'
        };
        return locations[location] || location || 'N/A';
    },

    getStatusBadge(status) {
        const badges = {
            'pending': 'badge-warning',
            'approved': 'badge-success',
            'rejected': 'badge-danger',
            'expired': 'badge-secondary'
        };
        return badges[status] || 'badge-secondary';
    },

    filterPromotions(filter) {
        this.currentFilter = filter;
        this.renderPromotions();
    },

    async approvePromotion(promotionId) {
        if (!confirm('Are you sure you want to approve this promotion? The service will be promoted automatically based on the selected type.')) {
            return;
        }

        try {
            Utils.showToast('Processing approval...', 'info');

            const response = await fetch(`${CONFIG.API_BASE_URL}/admin/promotions/${promotionId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                Utils.showToast('Promotion approved successfully! Service is now promoted.', 'success');
                await this.loadPromotions();
            } else {
                Utils.showToast(data.message || 'Failed to approve promotion', 'error');
            }
        } catch (error) {
            console.error('Error approving promotion:', error);
            Utils.showToast('Failed to approve promotion', 'error');
        }
    },

    async rejectPromotion(promotionId) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        if (reason === null) {
            return; // User cancelled
        }

        try {
            Utils.showToast('Processing rejection...', 'info');

            const response = await fetch(`${CONFIG.API_BASE_URL}/admin/promotions/${promotionId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (data.success) {
                Utils.showToast('Promotion rejected', 'success');
                await this.loadPromotions();
            } else {
                Utils.showToast(data.message || 'Failed to reject promotion', 'error');
            }
        } catch (error) {
            console.error('Error rejecting promotion:', error);
            Utils.showToast('Failed to reject promotion', 'error');
        }
    },

    viewDetails(promotionId) {
        const promo = this.promotions.find(p => p.id === promotionId);
        if (!promo) return;

        alert(`
Promotion Details:
------------------
Service: ${promo.service_title}
Provider: ${promo.provider_name}
Type: ${this.formatPromotionType(promo.promotion_type)}
Location: ${this.formatLocation(promo.promotion_location)}
Amount: TZS ${(promo.cost || 0).toLocaleString()}
Duration: ${promo.duration_days} days
Payment Method: ${promo.payment_method}
Payment Reference: ${promo.payment_reference || 'N/A'}
Status: ${promo.status}
Created: ${Utils.formatDate(promo.created_at)}
Expires: ${promo.expires_at ? Utils.formatDate(promo.expires_at) : 'N/A'}
        `);
    },

    destroy() {}
};

// Make methods accessible globally
window.PromotionsPage = PromotionsPage;
