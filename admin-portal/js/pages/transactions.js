import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const TransactionsPage = {
    transactions: [],
    currentPage: 1,

    async init() {
        await this.loadTransactions();
    },

    async loadTransactions(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading transactions...');

            const response = await api.getTransactions({ page, limit: CONFIG.PAGINATION.DEFAULT_LIMIT });
            this.transactions = response.transactions || [];
            this.currentPage = page;
            this.renderTransactions(response);
        } catch (error) {
            console.error('Error loading transactions:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Transactions</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="TransactionsPage.loadTransactions()">Try Again</button>
                </div>
            `;
        }
    },

    renderTransactions(data) {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="transactions-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Transactions</h1>
                        <p class="page-subtitle">View all payment transactions</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportTransactions">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderTransactionsTable()}
                    </div>
                </div>
                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadTransactions(page))}
                </div>
            </div>
        `;
    },

    renderTransactionsTable() {
        if (!this.transactions || this.transactions.length === 0) {
            return Components.emptyState('exchange-alt', 'No Transactions', 'No transactions found');
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>User</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.transactions.map(t => `
                        <tr>
                            <td>${t.reference || t.id}</td>
                            <td>${t.user?.name || 'N/A'}</td>
                            <td>${t.service || 'N/A'}</td>
                            <td>${Utils.formatCurrency(t.amount || 0)}</td>
                            <td>${t.type || 'N/A'}</td>
                            <td>${Utils.getStatusBadge(t.status)}</td>
                            <td>${Utils.formatDate(t.createdAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    destroy() {}
};
