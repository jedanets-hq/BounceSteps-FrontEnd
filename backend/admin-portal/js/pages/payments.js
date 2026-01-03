import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const PaymentsPage = {
    payments: [],
    currentPage: 1,
    filters: {},

    async init() {
        await this.loadPayments();
        this.setupEventListeners();
    },

    async loadPayments(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading payments...');

            const params = { page, limit: CONFIG.PAGINATION.DEFAULT_LIMIT, ...this.filters };
            const response = await api.getAllPayments(params);
            this.payments = response.payments || [];
            this.currentPage = page;

            this.renderPayments(response);
        } catch (error) {
            console.error('Error loading payments:', error);
            Utils.showToast('Failed to load payments', 'error');
        }
    },

    renderPayments(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="payments-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Payments Management</h1>
                        <p class="page-subtitle">Track all payment transactions</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportPayments">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <div class="stats-grid stats-grid-4">
                    ${Components.statCard('Total Payments', Utils.formatNumber(data.stats?.total || 0), 'credit-card', null, 'primary')}
                    ${Components.statCard('Completed', Utils.formatCurrency(data.stats?.completed || 0), 'check-circle', null, 'success')}
                    ${Components.statCard('Pending', Utils.formatCurrency(data.stats?.pending || 0), 'clock', null, 'warning')}
                    ${Components.statCard('Failed', Utils.formatNumber(data.stats?.failed || 0), 'times-circle', null, 'danger')}
                </div>

                ${Components.filterBar([
            { type: 'search', key: 'search', placeholder: 'Search payments...' },
            { type: 'select', key: 'status', placeholder: 'All Status', options: CONFIG.STATUS.PAYMENTS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
            { type: 'date', key: 'dateFrom', placeholder: 'From Date' },
            { type: 'date', key: 'dateTo', placeholder: 'To Date' }
        ])}

                <div class="card">
                    <div class="card-body">
                        ${this.renderPaymentsTable(this.payments)}
                    </div>
                </div>

                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadPayments(page))}
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    renderPaymentsTable(payments) {
        if (!payments || payments.length === 0) {
            return Components.emptyState('credit-card', 'No Payments Found', 'No payments match your current filters');
        }

        const columns = [
            { key: 'id', label: 'Transaction ID', sortable: true, formatter: (val) => `#${val.substring(0, 8)}` },
            { key: 'user', label: 'User', sortable: false, formatter: (val) => val?.name || '-' },
            { key: 'amount', label: 'Amount', sortable: true, formatter: (val) => Utils.formatCurrency(val) },
            { key: 'method', label: 'Method', sortable: false },
            { key: 'status', label: 'Status', sortable: true, formatter: (val) => Utils.getStatusBadge(val) },
            { key: 'createdAt', label: 'Date', sortable: true, formatter: (val) => Utils.formatDate(val, true) }
        ];

        const actions = [
            { name: 'view', icon: 'eye', label: 'View', type: 'info' }
        ];

        return Components.dataTable(columns, payments, actions);
    },

    attachEventListeners() {
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.viewPayment(id);
            });
        });
    },

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.dataset.filter) {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.loadPayments(1);
            }
        });

        document.addEventListener('input', Utils.debounce((e) => {
            if (e.target.dataset.filter === 'search') {
                this.filters.search = e.target.value;
                this.loadPayments(1);
            }
        }, 500));
    },

    async viewPayment(id) {
        try {
            const payment = await api.getPaymentById(id);
            Utils.showToast('Payment details loaded', 'success');
        } catch (error) {
            Utils.showToast('Failed to load payment', 'error');
        }
    },

    destroy() { }
};
