import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const PreOrdersPage = {
    preOrders: [],
    currentPage: 1,

    async init() {
        await this.loadPreOrders();
    },

    async loadPreOrders(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading pre-orders...');

            const response = await api.getPreOrders({ page, limit: CONFIG.PAGINATION.DEFAULT_LIMIT });
            this.preOrders = response.preOrders || [];
            this.currentPage = page;
            this.renderPreOrders(response);
        } catch (error) {
            console.error('Error loading pre-orders:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Pre-Orders</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="PreOrdersPage.loadPreOrders()">Try Again</button>
                </div>
            `;
        }
    },

    renderPreOrders(data) {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="pre-orders-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Pre-Orders</h1>
                        <p class="page-subtitle">Manage pending pre-orders</p>
                    </div>
                </div>
                <div class="stats-grid stats-grid-2">
                    ${Components.statCard('Total Pre-Orders', Utils.formatNumber(data.total || 0), 'shopping-cart', null, 'primary')}
                    ${Components.statCard('Pending', Utils.formatNumber(this.preOrders.length), 'clock', null, 'warning')}
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderPreOrdersTable()}
                    </div>
                </div>
                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadPreOrders(page))}
                </div>
            </div>
        `;
    },

    renderPreOrdersTable() {
        if (!this.preOrders || this.preOrders.length === 0) {
            return Components.emptyState('shopping-cart', 'No Pre-Orders', 'No pre-orders found');
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Service</th>
                        <th>Traveler</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.preOrders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.service?.title || 'N/A'}</td>
                            <td>${order.traveler?.name || 'N/A'}</td>
                            <td>${Utils.formatCurrency(order.totalAmount || 0)}</td>
                            <td>${Utils.formatDate(order.bookingDate)}</td>
                            <td>${Utils.getStatusBadge(order.status)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    destroy() {}
};
