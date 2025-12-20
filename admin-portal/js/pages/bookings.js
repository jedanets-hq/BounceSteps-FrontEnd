import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const BookingsPage = {
    bookings: [],
    currentPage: 1,
    filters: {},

    async init() {
        await this.loadBookings();
        this.setupEventListeners();
    },

    async loadBookings(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading bookings...');

            const params = { page, limit: CONFIG.PAGINATION.DEFAULT_LIMIT, ...this.filters };
            const response = await api.getAllBookings(params);
            this.bookings = response.bookings || [];
            this.currentPage = page;

            this.renderBookings(response);
        } catch (error) {
            console.error('Error loading bookings:', error);
            Utils.showToast('Failed to load bookings', 'error');
        }
    },

    renderBookings(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="bookings-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Bookings Management</h1>
                        <p class="page-subtitle">Monitor and manage all bookings</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportBookings">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                </div>

                <div class="stats-grid stats-grid-4">
                    ${Components.statCard('Total Bookings', Utils.formatNumber(data.stats?.total || 0), 'calendar-check', null, 'primary')}
                    ${Components.statCard('Confirmed', Utils.formatNumber(data.stats?.confirmed || 0), 'check', null, 'success')}
                    ${Components.statCard('Pending', Utils.formatNumber(data.stats?.pending || 0), 'clock', null, 'warning')}
                    ${Components.statCard('Revenue', Utils.formatCurrency(data.stats?.revenue || 0), 'dollar-sign', null, 'accent')}
                </div>

                ${Components.filterBar([
            { type: 'search', key: 'search', placeholder: 'Search bookings...' },
            { type: 'select', key: 'status', placeholder: 'All Status', options: CONFIG.STATUS.BOOKINGS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
            { type: 'date', key: 'dateFrom', placeholder: 'From Date' },
            { type: 'date', key: 'dateTo', placeholder: 'To Date' }
        ])}

                <div class="bookings-grid">
                    ${this.renderBookingsGrid(this.bookings)}
                </div>

                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadBookings(page))}
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    renderBookingsGrid(bookings) {
        if (!bookings || bookings.length === 0) {
            return Components.emptyState('calendar-check', 'No Bookings Found', 'No bookings match your current filters');
        }

        return bookings.map(booking => Components.bookingCard(booking)).join('');
    },

    attachEventListeners() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;

                switch (action) {
                    case 'view': this.viewBooking(id); break;
                    case 'cancel': this.cancelBooking(id); break;
                }
            });
        });
    },

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.dataset.filter) {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.loadBookings(1);
            }
        });

        document.addEventListener('input', Utils.debounce((e) => {
            if (e.target.dataset.filter === 'search') {
                this.filters.search = e.target.value;
                this.loadBookings(1);
            }
        }, 500));
    },

    async viewBooking(id) {
        try {
            const booking = await api.getBookingById(id);
            Utils.showToast('Booking details loaded', 'success');
        } catch (error) {
            Utils.showToast('Failed to load booking', 'error');
        }
    },

    async cancelBooking(id) {
        Utils.showConfirm('Cancel Booking', 'Are you sure you want to cancel this booking?', async () => {
            try {
                await api.cancelBooking(id, 'Cancelled by admin');
                Utils.showToast('Booking cancelled', 'success');
                this.loadBookings(this.currentPage);
            } catch (error) {
                Utils.showToast('Failed to cancel booking', 'error');
            }
        });
    },

    destroy() { }
};
