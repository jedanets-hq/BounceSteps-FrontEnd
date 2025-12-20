import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const ServiceApprovalPage = {
    services: [],
    currentPage: 1,

    async init() {
        await this.loadPendingServices();
        this.setupEventListeners();
    },

    async loadPendingServices(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading pending services...');

            const params = { page, limit: CONFIG.PAGINATION.DEFAULT_LIMIT, status: 'pending' };
            console.log('Fetching pending services...');
            const response = await api.getAllServices(params);
            console.log('Pending services response:', response);
            
            this.services = response.services || [];
            this.currentPage = page;

            this.renderPendingServices(response);
        } catch (error) {
            console.error('Error loading pending services:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Pending Services</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message || 'Unable to connect to the server'}</p>
                    <button class="btn btn-primary" onclick="ServiceApprovalPage.loadPendingServices()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
            Utils.showToast('Failed to load pending services', 'error');
        }
    },

    renderPendingServices(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="services-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Pending Service Approvals</h1>
                        <p class="page-subtitle">Review and approve new services submitted by providers</p>
                    </div>
                </div>

                <div class="stats-grid stats-grid-3">
                    ${Components.statCard('Pending', Utils.formatNumber(data.stats?.pending || 0), 'clock', null, 'warning')}
                    ${Components.statCard('Total Services', Utils.formatNumber(data.stats?.total || 0), 'concierge-bell', null, 'primary')}
                    ${Components.statCard('Active', Utils.formatNumber(data.stats?.active || 0), 'check-circle', null, 'success')}
                </div>

                <div class="services-grid">
                    ${this.renderServicesGrid(this.services)}
                </div>

                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadPendingServices(page))}
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    renderServicesGrid(services) {
        if (!services || services.length === 0) {
            return Components.emptyState('check-circle', 'No Pending Services', 'All services have been reviewed. Great job!');
        }

        return services.map(service => Components.serviceCard(service)).join('');
    },

    attachEventListeners() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;

                switch (action) {
                    case 'view': this.viewService(id); break;
                    case 'approve': this.approveService(id); break;
                    case 'reject': this.rejectService(id); break;
                }
            });
        });
    },

    setupEventListeners() {
        // Any global event listeners
    },

    async viewService(id) {
        try {
            const response = await api.getServiceById(id);
            const service = response.service || response;
            this.showServiceDetailsModal(service);
        } catch (error) {
            Utils.showToast('Failed to load service', 'error');
        }
    },

    showServiceDetailsModal(service) {
        const content = `
            <div class="service-details">
                <div class="service-details-header">
                    <img src="${service.images?.[0] || '/placeholder-service.jpg'}" alt="${service.title}" class="service-details-image" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;">
                    <h3 style="margin-top: 16px;">${service.title}</h3>
                    <p style="color: var(--color-muted-foreground);">${service.category}</p>
                </div>
                <div class="service-details-body" style="margin-top: 16px;">
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value" style="font-weight: 600;">TZS ${Utils.formatNumber(service.price || 0)}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${service.location || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
                        <span class="detail-label">Provider:</span>
                        <span class="detail-value">${service.business_name || service.provider?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-row" style="padding: 8px 0;">
                        <span class="detail-label">Description:</span>
                        <p style="margin-top: 8px; color: var(--color-muted-foreground);">${service.description || 'No description'}</p>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modalContainer') || this.createModalContainer();
        modalContainer.innerHTML = Components.modal('serviceDetailsModal', 'Service Details', content, `
            <button class="btn btn-outline modal-close-btn">Close</button>
            <button class="btn btn-danger" onclick="ServiceApprovalPage.rejectService('${service.id}')">Reject</button>
            <button class="btn btn-success" onclick="ServiceApprovalPage.approveService('${service.id}')">Approve</button>
        `);

        modalContainer.querySelector('.modal-close')?.addEventListener('click', () => modalContainer.innerHTML = '');
        modalContainer.querySelector('.modal-close-btn')?.addEventListener('click', () => modalContainer.innerHTML = '');
    },

    createModalContainer() {
        const container = document.createElement('div');
        container.id = 'modalContainer';
        document.body.appendChild(container);
        return container;
    },

    async approveService(id) {
        Utils.showConfirm('Approve Service', 'Are you sure you want to approve this service? It will become visible to travelers.', async () => {
            try {
                await api.approveService(id);
                Utils.showToast('Service approved successfully', 'success');
                document.getElementById('modalContainer').innerHTML = '';
                this.loadPendingServices(this.currentPage);
            } catch (error) {
                Utils.showToast('Failed to approve service', 'error');
            }
        });
    },

    async rejectService(id) {
        Utils.showConfirm('Reject Service', 'Are you sure you want to reject this service?', async () => {
            try {
                await api.rejectService(id, 'Rejected by admin');
                Utils.showToast('Service rejected', 'success');
                document.getElementById('modalContainer').innerHTML = '';
                this.loadPendingServices(this.currentPage);
            } catch (error) {
                Utils.showToast('Failed to reject service', 'error');
            }
        });
    },

    destroy() { }
};

// Make it globally accessible for onclick handlers
window.ServiceApprovalPage = ServiceApprovalPage;
