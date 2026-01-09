import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const UsersPage = {
    users: [],
    currentPage: 1,
    filters: {},

    async init() {
        await this.loadUsers();
        this.setupEventListeners();
    },

    async loadUsers(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading users...');

            const params = {
                page,
                limit: CONFIG.PAGINATION.DEFAULT_LIMIT,
                ...this.filters
            };

            console.log('Fetching users...');
            const response = await api.getAllUsers(params);
            console.log('Users response:', response);
            
            this.users = response.users || [];
            this.currentPage = page;

            this.renderUsers(response);
        } catch (error) {
            console.error('Error loading users:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Users</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message || 'Unable to connect to the server'}</p>
                    <button class="btn btn-primary" onclick="UsersPage.loadUsers()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
            Utils.showToast('Failed to load users', 'error');
        }
    },

    renderUsers(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="users-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">User Management</h1>
                        <p class="page-subtitle">Manage all travelers and service providers</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="exportUsers">
                            <i class="fas fa-download"></i>
                            Export
                        </button>
                        <button class="btn btn-primary" id="addUser">
                            <i class="fas fa-user-plus"></i>
                            Add User
                        </button>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid stats-grid-4">
                    ${Components.statCard('Total Users', Utils.formatNumber(data.stats?.total || 0), 'users', null, 'primary')}
                    ${Components.statCard('Travelers', Utils.formatNumber(data.stats?.travelers || 0), 'user-tie', null, 'secondary')}
                    ${Components.statCard('Providers', Utils.formatNumber(data.stats?.providers || 0), 'briefcase', null, 'accent')}
                    ${Components.statCard('Google Users', Utils.formatNumber(data.stats?.googleUsers || 0), 'google', null, 'success')}
                </div>

                <!-- Filters -->
                ${Components.filterBar([
            { type: 'search', key: 'search', placeholder: 'Search users...' },
            {
                type: 'select',
                key: 'role',
                placeholder: 'All Roles',
                options: [
                    { value: 'traveler', label: 'Travelers' },
                    { value: 'service_provider', label: 'Service Providers' }
                ]
            },
            {
                type: 'select',
                key: 'status',
                placeholder: 'All Status',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'pending', label: 'Pending' }
                ]
            },
            {
                type: 'select',
                key: 'authProvider',
                placeholder: 'Auth Method',
                options: [
                    { value: 'google', label: 'Google Sign-In' },
                    { value: 'email', label: 'Email/Password' },
                    { value: 'both', label: 'Both Methods' }
                ]
            },
            { type: 'date', key: 'dateFrom', placeholder: 'From Date' },
            { type: 'date', key: 'dateTo', placeholder: 'To Date' }
        ])}

                <!-- Users Table -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderUsersTable(this.users)}
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadUsers(page))}
                </div>
            </div>
        `;

        this.attachTableEventListeners();
    },

    renderUsersTable(users) {
        if (!users || users.length === 0) {
            return Components.emptyState(
                'users',
                'No Users Found',
                'No users match your current filters',
                { action: 'addUser', icon: 'user-plus', label: 'Add User' }
            );
        }

        const columns = [
            {
                key: 'name', label: 'User', sortable: true, formatter: (val, row) => `
                <div class="user-cell">
                    <img src="${Utils.getAvatarUrl(row.name, row.avatar)}" alt="${row.name}" class="user-cell-avatar">
                    <div class="user-cell-info">
                        <div class="user-cell-name">
                            ${row.name}
                            ${row.isGoogleUser ? '<span class="google-badge" title="Google Sign-In"><i class="fab fa-google"></i></span>' : ''}
                        </div>
                        <div class="user-cell-email">${row.email}</div>
                    </div>
                </div>
            `},
            { key: 'phone', label: 'Phone', sortable: false, formatter: (val) => Utils.formatPhone(val) },
            { key: 'role', label: 'Role', sortable: true, formatter: (val) => Utils.getRoleBadge(val) },
            { key: 'authProvider', label: 'Auth', sortable: true, formatter: (val) => Utils.getAuthProviderBadge ? Utils.getAuthProviderBadge(val) : `<span class="badge badge-${val === 'google' ? 'info' : val === 'both' ? 'warning' : 'secondary'}">${val || 'email'}</span>` },
            { key: 'status', label: 'Status', sortable: true, formatter: (val) => Utils.getStatusBadge(val) },
            { key: 'createdAt', label: 'Joined', sortable: true, formatter: (val) => Utils.formatDate(val) }
        ];

        const actions = [
            { name: 'view', icon: 'eye', label: 'View Details', type: 'info' },
            { name: 'edit', icon: 'edit', label: 'Edit User', type: 'primary' },
            { name: 'verify', icon: 'check-circle', label: 'Verify', type: 'success' },
            { name: 'suspend', icon: 'ban', label: 'Block User', type: 'warning' },
            { name: 'unblock', icon: 'unlock', label: 'Unblock', type: 'secondary' },
            { name: 'delete', icon: 'trash', label: 'Delete Permanently', type: 'danger' }
        ];

        return Components.dataTable(columns, users, actions);
    },

    attachTableEventListeners() {
        // Table actions
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;

                switch (action) {
                    case 'view':
                        this.viewUser(id);
                        break;
                    case 'edit':
                        this.editUser(id);
                        break;
                    case 'verify':
                        this.verifyUser(id);
                        break;
                    case 'suspend':
                        this.suspendUser(id);
                        break;
                    case 'unblock':
                        this.unblockUser(id);
                        break;
                    case 'delete':
                        this.deleteUser(id);
                        break;
                    case 'addUser':
                        this.showAddUserModal();
                        break;
                }
            });
        });

        // Pagination
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.loadUsers(page);
                }
            });
        });
    },

    setupEventListeners() {
        // Export users
        document.addEventListener('click', (e) => {
            if (e.target.closest('#exportUsers')) {
                this.exportUsers();
            }
            if (e.target.closest('#addUser')) {
                this.showAddUserModal();
            }
        });

        // Filters
        document.addEventListener('change', (e) => {
            if (e.target.dataset.filter) {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.loadUsers(1);
            }
        });

        // Search with debounce
        document.addEventListener('input', Utils.debounce((e) => {
            if (e.target.dataset.filter === 'search') {
                this.filters.search = e.target.value;
                this.loadUsers(1);
            }
        }, 500));

        // Reset filters
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-reset')) {
                this.filters = {};
                document.querySelectorAll('[data-filter]').forEach(input => {
                    input.value = '';
                });
                this.loadUsers(1);
            }
        });
    },

    async viewUser(id) {
        try {
            const user = await api.getUserById(id);
            this.showUserDetailsModal(user);
        } catch (error) {
            Utils.showToast('Failed to load user details', 'error');
        }
    },

    showUserDetailsModal(user) {
        const content = `
            <div class="user-details">
                <div class="user-details-header">
                    <img src="${Utils.getAvatarUrl(user.name, user.avatar)}" alt="${user.name}" class="user-details-avatar">
                    <div>
                        <h3>
                            ${user.name}
                            ${user.isGoogleUser ? '<span class="google-badge" title="Google Sign-In"><i class="fab fa-google"></i></span>' : ''}
                        </h3>
                        <p>${user.email}</p>
                    </div>
                </div>
                <div class="user-details-body">
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${Utils.formatPhone(user.phone)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Role:</span>
                        <span class="detail-value">${Utils.getRoleBadge(user.role)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Auth Method:</span>
                        <span class="detail-value">${Utils.getAuthProviderBadge(user.authProvider)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${Utils.getStatusBadge(user.status)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Joined:</span>
                        <span class="detail-value">${Utils.formatDate(user.createdAt, true)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Active:</span>
                        <span class="detail-value">${Utils.timeAgo(user.lastActive)}</span>
                    </div>
                    ${user.role === 'service_provider' ? `
                        <div class="detail-row">
                            <span class="detail-label">Services:</span>
                            <span class="detail-value">${user.stats?.totalServices || 0}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Bookings:</span>
                            <span class="detail-value">${user.stats?.totalBookings || 0}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Revenue:</span>
                            <span class="detail-value">${Utils.formatCurrency(user.stats?.totalRevenue || 0)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const modal = Components.modal('userDetailsModal', 'User Details', content, `
            <button class="btn btn-outline modal-close-btn">Close</button>
            <button class="btn btn-primary" onclick="UsersPage.editUser('${user.id}')">Edit User</button>
        `);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modal;

        // Close modal handlers
        modalContainer.querySelector('.modal-close').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
        modalContainer.querySelector('.modal-close-btn').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
    },

    editUser(id) {
        // Implementation for editing user
        Utils.showToast('Edit user functionality coming soon', 'info');
    },

    async suspendUser(id) {
        Utils.showConfirm(
            'Block/Suspend User',
            'Are you sure you want to block this user? They will not be able to access their account until unblocked.',
            async () => {
                try {
                    await api.suspendUser(id, 'Blocked by admin');
                    Utils.showToast('User blocked successfully', 'success');
                    this.loadUsers(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to block user', 'error');
                }
            }
        );
    },

    async unblockUser(id) {
        Utils.showConfirm(
            'Unblock User',
            'Are you sure you want to unblock this user? They will regain access to their account.',
            async () => {
                try {
                    await api.put(`/admin/users/${id}/status`, { isActive: true });
                    Utils.showToast('User unblocked successfully', 'success');
                    this.loadUsers(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to unblock user', 'error');
                }
            }
        );
    },

    async deleteUser(id) {
        Utils.showConfirm(
            'Delete User Permanently',
            'WARNING: This will permanently delete this user and all their data including services, bookings, and reviews. This action CANNOT be undone!',
            async () => {
                try {
                    await api.deleteUser(id);
                    Utils.showToast('User deleted permanently', 'success');
                    this.loadUsers(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to delete user', 'error');
                }
            }
        );
    },

    async verifyUser(id) {
        Utils.showConfirm(
            'Verify User',
            'Are you sure you want to verify this user?',
            async () => {
                try {
                    await api.verifyUser(id);
                    Utils.showToast('User verified successfully', 'success');
                    this.loadUsers(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to verify user', 'error');
                }
            }
        );
    },

    showAddUserModal() {
        Utils.showToast('Add user functionality coming soon', 'info');
    },

    exportUsers() {
        const exportData = this.users.map(user => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone,
            Role: user.role,
            Status: user.status,
            Joined: Utils.formatDate(user.createdAt)
        }));

        Utils.downloadCSV(exportData, 'isafari_users');
    },

    destroy() {
        // Cleanup
    }
};
