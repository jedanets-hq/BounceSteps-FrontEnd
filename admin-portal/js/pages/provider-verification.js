import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const ProviderVerificationPage = {
    providers: [],
    currentPage: 1,
    filters: {},

    async init() {
        await this.loadProviders();
        this.setupEventListeners();
    },

    async loadProviders(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading providers...');

            const params = {
                page,
                limit: CONFIG.PAGINATION.DEFAULT_LIMIT,
                ...this.filters
            };

            const response = await api.get('/admin/providers/verification', params);
            
            this.providers = response.providers || [];
            this.currentPage = page;

            this.renderProviders(response);
        } catch (error) {
            console.error('Error loading providers:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Providers</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message || 'Unable to connect to the server'}</p>
                    <button class="btn btn-primary" onclick="ProviderVerificationPage.loadProviders()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
            Utils.showToast('Failed to load providers', 'error');
        }
    },

    renderProviders(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="provider-verification-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Provider Verification</h1>
                        <p class="page-subtitle">Manage verification badges for service providers</p>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid stats-grid-3">
                    ${Components.statCard('Total Providers', Utils.formatNumber(data.stats?.total || 0), 'briefcase', null, 'primary')}
                    ${Components.statCard('Verified', Utils.formatNumber(data.stats?.verified || 0), 'check-circle', null, 'success')}
                    ${Components.statCard('Unverified', Utils.formatNumber(data.stats?.unverified || 0), 'clock', null, 'warning')}
                </div>

                <!-- Filters -->
                ${Components.filterBar([
                    { type: 'search', key: 'search', placeholder: 'Search providers...' },
                    {
                        type: 'select',
                        key: 'status',
                        placeholder: 'All Status',
                        options: [
                            { value: 'verified', label: 'Verified' },
                            { value: 'unverified', label: 'Unverified' }
                        ]
                    }
                ])}

                <!-- Providers Table -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderProvidersTable(this.providers)}
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadProviders(page))}
                </div>
            </div>
        `;

        this.attachTableEventListeners();
    },

    renderProvidersTable(providers) {
        if (!providers || providers.length === 0) {
            return Components.emptyState(
                'briefcase',
                'No Providers Found',
                'No service providers match your current filters'
            );
        }

        const columns = [
            {
                key: 'businessName', label: 'Provider', sortable: true, formatter: (val, row) => `
                <div class="user-cell">
                    <img src="${Utils.getAvatarUrl(row.businessName, row.user?.avatar)}" alt="${row.businessName}" class="user-cell-avatar">
                    <div class="user-cell-info">
                        <div class="user-cell-name">${row.businessName || 'Unknown Business'}</div>
                        <div class="user-cell-email">${row.user?.email || ''}</div>
                    </div>
                </div>
            `},
            { key: 'businessType', label: 'Type', sortable: true },
            { key: 'location', label: 'Location', sortable: true },
            { key: 'rating', label: 'Rating', sortable: true, formatter: (val) => `⭐ ${parseFloat(val || 0).toFixed(1)}` },
            { 
                key: 'isVerified', 
                label: 'Status', 
                sortable: true, 
                formatter: (val) => val 
                    ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Verified</span>'
                    : '<span class="badge badge-warning"><i class="fas fa-clock"></i> Unverified</span>'
            },
            { key: 'createdAt', label: 'Joined', sortable: true, formatter: (val) => Utils.formatDate(val) }
        ];

        const actions = [
            { name: 'view', icon: 'eye', label: 'View Details', type: 'info' },
            { name: 'verify', icon: 'check-circle', label: 'Add Badge', type: 'success' },
            { name: 'remove-badge', icon: 'times-circle', label: 'Remove Badge', type: 'danger' }
        ];

        return Components.dataTable(columns, providers, actions);
    },

    attachTableEventListeners() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;

                switch (action) {
                    case 'view':
                        this.viewProvider(id);
                        break;
                    case 'verify':
                        this.addVerificationBadge(id);
                        break;
                    case 'remove-badge':
                        this.removeVerificationBadge(id);
                        break;
                }
            });
        });

        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.loadProviders(page);
                }
            });
        });
    },

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.dataset.filter) {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.loadProviders(1);
            }
        });

        document.addEventListener('input', Utils.debounce((e) => {
            if (e.target.dataset.filter === 'search') {
                this.filters.search = e.target.value;
                this.loadProviders(1);
            }
        }, 500));

        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-reset')) {
                this.filters = {};
                document.querySelectorAll('[data-filter]').forEach(input => {
                    input.value = '';
                });
                this.loadProviders(1);
            }
        });
    },

    async viewProvider(id) {
        const provider = this.providers.find(p => p.id == id);
        if (provider) {
            this.showProviderDetailsModal(provider);
        }
    },

    showProviderDetailsModal(provider) {
        const content = `
            <div class="provider-details">
                <div class="provider-details-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <img src="${Utils.getAvatarUrl(provider.businessName, provider.user?.avatar)}" alt="${provider.businessName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.25rem;">${provider.businessName || 'Unknown Business'}</h3>
                        <p style="margin: 4px 0 0; color: #6b7280;">${provider.user?.email || ''}</p>
                        ${provider.isVerified 
                            ? '<span class="badge badge-success" style="margin-top: 8px;"><i class="fas fa-check-circle"></i> Verified Provider</span>'
                            : '<span class="badge badge-warning" style="margin-top: 8px;"><i class="fas fa-clock"></i> Not Verified</span>'
                        }
                    </div>
                </div>
                <div class="provider-details-body">
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Business Type:</span>
                        <span style="font-weight: 500;">${provider.businessType || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Location:</span>
                        <span style="font-weight: 500;">${provider.location || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Rating:</span>
                        <span style="font-weight: 500;">⭐ ${parseFloat(provider.rating || 0).toFixed(1)}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280;">Phone:</span>
                        <span style="font-weight: 500;">${provider.user?.phone || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 12px 0;">
                        <span style="color: #6b7280;">Joined:</span>
                        <span style="font-weight: 500;">${Utils.formatDate(provider.createdAt)}</span>
                    </div>
                    ${provider.description ? `
                        <div style="margin-top: 16px;">
                            <span style="color: #6b7280; display: block; margin-bottom: 8px;">Description:</span>
                            <p style="margin: 0; color: #374151;">${provider.description}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const modal = Components.modal('providerDetailsModal', 'Provider Details', content, `
            <button class="btn btn-outline modal-close-btn">Close</button>
            ${provider.isVerified 
                ? `<button class="btn btn-danger" onclick="ProviderVerificationPage.removeVerificationBadge('${provider.id}')">Remove Badge</button>`
                : `<button class="btn btn-success" onclick="ProviderVerificationPage.addVerificationBadge('${provider.id}')">Add Verification Badge</button>`
            }
        `);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modal;

        modalContainer.querySelector('.modal-close').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
        modalContainer.querySelector('.modal-close-btn').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
    },

    async addVerificationBadge(id) {
        Utils.showConfirm(
            'Add Verification Badge',
            'Are you sure you want to add a verification badge to this service provider? This badge will be visible to travelers.',
            async () => {
                try {
                    await api.post(`/admin/providers/${id}/verify-badge`);
                    Utils.showToast('Verification badge added successfully', 'success');
                    document.getElementById('modalContainer').innerHTML = '';
                    this.loadProviders(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to add verification badge', 'error');
                }
            }
        );
    },

    async removeVerificationBadge(id) {
        Utils.showConfirm(
            'Remove Verification Badge',
            'Are you sure you want to remove the verification badge from this service provider?',
            async () => {
                try {
                    await api.post(`/admin/providers/${id}/remove-badge`);
                    Utils.showToast('Verification badge removed successfully', 'success');
                    document.getElementById('modalContainer').innerHTML = '';
                    this.loadProviders(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to remove verification badge', 'error');
                }
            }
        );
    },

    destroy() {}
};

// Make it globally accessible
window.ProviderVerificationPage = ProviderVerificationPage;
