import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const PayoutsPage = {
    payouts: [],
    currentPage: 1,

    async init() {
        await this.loadPayouts();
    },

    async loadPayouts(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading payouts...');

            const response = await api.getPayouts({ page, limit: CONFIG.PAGINATION.DEFAULT_LIMIT });
            this.payouts = response.payouts || [];
            this.currentPage = page;
            this.renderPayouts(response);
        } catch (error) {
            console.error('Error loading payouts:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Payouts</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="PayoutsPage.loadPayouts()">Try Again</button>
                </div>
            `;
        }
    },

    renderPayouts(data) {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="payouts-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Payouts</h1>
                        <p class="page-subtitle">Manage provider payouts</p>
                    </div>
                </div>
                <div class="stats-grid stats-grid-2">
                    ${Components.statCard('Total Providers', Utils.formatNumber(data.total || 0), 'users', null, 'primary')}
                    ${Components.statCard('Pending Payouts', Utils.formatNumber(this.payouts.filter(p => p.status === 'pending').length), 'clock', null, 'warning')}
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderPayoutsTable()}
                    </div>
                </div>
                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadPayouts(page))}
                </div>
            </div>
        `;
    },

    renderPayoutsTable() {
        if (!this.payouts || this.payouts.length === 0) {
            return Components.emptyState('money-bill-wave', 'No Payouts', 'No payout data found');
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Provider</th>
                        <th>Email</th>
                        <th>Total Earnings</th>
                        <th>Bookings</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.payouts.map(p => `
                        <tr>
                            <td>${p.provider?.name || 'N/A'}</td>
                            <td>${p.provider?.email || 'N/A'}</td>
                            <td>${Utils.formatCurrency(p.totalEarnings || 0)}</td>
                            <td>${p.totalBookings || 0}</td>
                            <td>${Utils.getStatusBadge(p.status || 'pending')}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" data-action="process" data-id="${p.id}">
                                    Process
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    destroy() {}
};
