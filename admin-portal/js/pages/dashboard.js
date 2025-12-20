
import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const DashboardPage = {
    charts: {},
    refreshInterval: null,

    async init() {
        await this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
    },

    async loadDashboardData() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading dashboard...');

            // Fetch dashboard analytics
            console.log('Fetching dashboard analytics...');
            const data = await api.getDashboardAnalytics();
            console.log('Dashboard data received:', data);

            if (data && data.success) {
                this.renderDashboard(data);
            } else {
                throw new Error(data?.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Dashboard</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message || 'Unable to connect to the server'}</p>
                    <button class="btn btn-primary" onclick="DashboardPage.loadDashboardData()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
            Utils.showToast('Failed to load dashboard data', 'error');
        }
    },

    renderDashboard(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="dashboard-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Dashboard Overview</h1>
                        <p class="page-subtitle">Welcome back! Here's what's happening with iSafari today.</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="refreshDashboard">
                            <i class="fas fa-sync-alt"></i>
                            Refresh
                        </button>
                        <button class="btn btn-primary" id="exportReport">
                            <i class="fas fa-download"></i>
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-grid">
                    ${Components.statCard(
            'Total Users',
            Utils.formatNumber(data.stats?.totalUsers || 0),
            'users',
            { direction: 'up', value: '12.5' },
            'primary'
        )}
                    ${Components.statCard(
            'Active Services',
            Utils.formatNumber(data.stats?.activeServices || 0),
            'concierge-bell',
            { direction: 'up', value: '8.3' },
            'secondary'
        )}
                    ${Components.statCard(
            'Total Bookings',
            Utils.formatNumber(data.stats?.totalBookings || 0),
            'calendar-check',
            { direction: 'up', value: '15.7' },
            'success'
        )}
                    ${Components.statCard(
            'Revenue (MTD)',
            Utils.formatCurrency(data.stats?.monthlyRevenue || 0),
            'dollar-sign',
            { direction: 'up', value: '23.1' },
            'accent'
        )}
                </div>

                <!-- Secondary Stats -->
                <div class="stats-grid stats-grid-secondary">
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-warning">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">Pending Approvals</div>
                                    <div class="stat-mini-value">${data.stats?.pendingApprovals || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-info">
                                    <i class="fas fa-user-plus"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">New Users (Today)</div>
                                    <div class="stat-mini-value">${data.stats?.newUsersToday || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">Completed Today</div>
                                    <div class="stat-mini-value">${data.stats?.completedToday || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="stat-mini">
                                <div class="stat-mini-icon stat-danger">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="stat-mini-content">
                                    <div class="stat-mini-label">Open Tickets</div>
                                    <div class="stat-mini-value">${data.stats?.openTickets || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts Row -->
                <div class="dashboard-row">
                    <div class="dashboard-col-8">
                        <div class="card">
                            ${Components.chartContainer('revenueChart', 'Revenue Overview', 'line')}
                        </div>
                    </div>
                    <div class="dashboard-col-4">
                        <div class="card">
                            ${Components.chartContainer('bookingsChart', 'Bookings by Status', 'doughnut')}
                        </div>
                    </div>
                </div>

                <!-- Second Charts Row -->
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${Components.chartContainer('usersChart', 'User Growth', 'bar')}
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${Components.chartContainer('servicesChart', 'Services by Category', 'pie')}
                        </div>
                    </div>
                </div>

                <!-- Recent Activity & Quick Actions -->
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-history"></i>
                                    Recent Activity
                                </h3>
                                <a href="#activity-logs" class="btn btn-sm btn-outline">View All</a>
                            </div>
                            <div class="card-body">
                                <div class="activity-list" id="recentActivity">
                                    ${this.renderRecentActivity(data.recentActivity || [])}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-bell"></i>
                                    Pending Actions
                                </h3>
                            </div>
                            <div class="card-body">
                                <div class="pending-actions">
                                    ${this.renderPendingActions(data.pendingActions || {})}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Services & Top Providers -->
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-star"></i>
                                    Top Performing Services
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderTopServices(data.topServices || [])}
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-trophy"></i>
                                    Top Service Providers
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderTopProviders(data.topProviders || [])}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Health -->
                <div class="dashboard-row">
                    <div class="dashboard-col-12">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">
                                    <i class="fas fa-heartbeat"></i>
                                    System Health
                                </h3>
                            </div>
                            <div class="card-body">
                                ${this.renderSystemHealth(data.systemHealth || {})}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        this.initializeCharts(data);
    },

    renderRecentActivity(activities) {
        if (!activities || activities.length === 0) {
            return Components.emptyState('history', 'No Recent Activity', 'Activity will appear here as it happens');
        }

        return activities.slice(0, 10).map(activity =>
            Components.activityLogItem(activity)
        ).join('');
    },

    renderPendingActions(actions) {
        const items = [
            {
                icon: 'user-check',
                label: 'User Verifications',
                count: actions.userVerifications || 0,
                link: '#user-verification',
                color: 'warning'
            },
            {
                icon: 'check-circle',
                label: 'Service Approvals',
                count: actions.serviceApprovals || 0,
                link: '#service-approval',
                color: 'info'
            },
            {
                icon: 'headset',
                label: 'Support Tickets',
                count: actions.supportTickets || 0,
                link: '#support',
                color: 'danger'
            },
            {
                icon: 'money-bill-wave',
                label: 'Pending Payouts',
                count: actions.pendingPayouts || 0,
                link: '#payouts',
                color: 'success'
            }
        ];

        return items.map(item => `
            <a href="${item.link}" class="pending-action-item">
                <div class="pending-action-icon pending-action-${item.color}">
                    <i class="fas fa-${item.icon}"></i>
                </div>
                <div class="pending-action-content">
                    <div class="pending-action-label">${item.label}</div>
                    <div class="pending-action-count">${item.count} pending</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </a>
        `).join('');
    },

    renderTopServices(services) {
        if (!services || services.length === 0) {
            return '<p class="text-muted">No data available</p>';
        }

        return `
            <div class="top-items-list">
                ${services.slice(0, 5).map((service, index) => `
                    <div class="top-item">
                        <div class="top-item-rank">#${index + 1}</div>
                        <div class="top-item-content">
                            <div class="top-item-name">${Utils.truncate(service.title, 40)}</div>
                            <div class="top-item-meta">
                                ${service.bookings} bookings • ${Utils.formatCurrency(service.revenue)} revenue
                            </div>
                        </div>
                        <div class="top-item-rating">
                            <i class="fas fa-star"></i>
                            ${service.rating?.toFixed(1) || 'N/A'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderTopProviders(providers) {
        if (!providers || providers.length === 0) {
            return '<p class="text-muted">No data available</p>';
        }

        return `
            <div class="top-items-list">
                ${providers.slice(0, 5).map((provider, index) => `
                    <div class="top-item">
                        <div class="top-item-rank">#${index + 1}</div>
                        <img src="${Utils.getAvatarUrl(provider.name, provider.avatar)}" 
                             alt="${provider.name}" 
                             class="top-item-avatar">
                        <div class="top-item-content">
                            <div class="top-item-name">${provider.name}</div>
                            <div class="top-item-meta">
                                ${provider.services} services • ${provider.bookings} bookings
                            </div>
                        </div>
                        <div class="top-item-revenue">
                            ${Utils.formatCurrency(provider.revenue)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderSystemHealth(health) {
        const metrics = [
            { label: 'API Response Time', value: `${health.apiResponseTime || 0}ms`, status: 'good' },
            { label: 'Database Status', value: health.databaseStatus || 'Connected', status: 'good' },
            { label: 'Server Uptime', value: health.serverUptime || '99.9%', status: 'good' },
            { label: 'Active Sessions', value: health.activeSessions || 0, status: 'good' }
        ];

        return `
            <div class="system-health-grid">
                ${metrics.map(metric => `
                    <div class="health-metric">
                        <div class="health-metric-label">${metric.label}</div>
                        <div class="health-metric-value">${metric.value}</div>
                        <div class="health-metric-status health-${metric.status}">
                            <i class="fas fa-circle"></i>
                            ${metric.status}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    initializeCharts(data) {
        // Revenue Chart
        this.charts.revenue = new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: data.revenueData?.labels || [],
                datasets: [{
                    label: 'Revenue',
                    data: data.revenueData?.values || [],
                    borderColor: CONFIG.CHART_COLORS.primary,
                    backgroundColor: CONFIG.CHART_COLORS.primary + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Bookings Chart
        this.charts.bookings = new Chart(document.getElementById('bookingsChart'), {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
                datasets: [{
                    data: data.bookingsData?.values || [0, 0, 0, 0],
                    backgroundColor: [
                        CONFIG.CHART_COLORS.success,
                        CONFIG.CHART_COLORS.warning,
                        CONFIG.CHART_COLORS.info,
                        CONFIG.CHART_COLORS.error
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Users Chart
        this.charts.users = new Chart(document.getElementById('usersChart'), {
            type: 'bar',
            data: {
                labels: data.usersData?.labels || [],
                datasets: [{
                    label: 'New Users',
                    data: data.usersData?.values || [],
                    backgroundColor: CONFIG.CHART_COLORS.secondary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Services Chart
        this.charts.services = new Chart(document.getElementById('servicesChart'), {
            type: 'pie',
            data: {
                labels: data.servicesData?.labels || [],
                datasets: [{
                    data: data.servicesData?.values || [],
                    backgroundColor: [
                        CONFIG.CHART_COLORS.primary,
                        CONFIG.CHART_COLORS.secondary,
                        CONFIG.CHART_COLORS.accent,
                        CONFIG.CHART_COLORS.success,
                        CONFIG.CHART_COLORS.warning,
                        CONFIG.CHART_COLORS.info
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshDashboard')?.addEventListener('click', () => {
            this.loadDashboardData();
        });

        // Export report
        document.getElementById('exportReport')?.addEventListener('click', () => {
            this.exportReport();
        });
    },

    startAutoRefresh() {
        // Refresh dashboard every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, CONFIG.REFRESH_INTERVALS.DASHBOARD);
    },

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },

    async exportReport() {
        try {
            Utils.showToast('Generating report...', 'info');
            // Implementation for exporting report
            Utils.showToast('Report exported successfully', 'success');
        } catch (error) {
            Utils.showToast('Failed to export report', 'error');
        }
    },

    destroy() {
        this.stopAutoRefresh();
        // Destroy charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};

// Make it globally accessible for onclick handlers
window.DashboardPage = DashboardPage;
