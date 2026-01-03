import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const AnalyticsPage = {
    charts: {},

    async init() {
        await this.loadAnalytics();
    },

    async loadAnalytics() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading analytics...');

            const data = await api.getDashboardAnalytics();
            this.renderAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
            Utils.showToast('Failed to load analytics', 'error');
        }
    },

    renderAnalytics(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="analytics-page">
                <div class="page-header">
                    <h1 class="page-title">Analytics & Insights</h1>
                    <p class="page-subtitle">Detailed analytics and performance metrics</p>
                </div>

                <div class="dashboard-row">
                    <div class="dashboard-col-12">
                        <div class="card">
                            ${Components.chartContainer('analyticsRevenueChart', 'Revenue Trends', 'line')}
                        </div>
                    </div>
                </div>

                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${Components.chartContainer('analyticsUsersChart', 'User Analytics', 'bar')}
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            ${Components.chartContainer('analyticsBookingsChart', 'Booking Analytics', 'line')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeCharts(data);
    },

    initializeCharts(data) {
        // Initialize charts similar to dashboard
        this.charts.revenue = new Chart(document.getElementById('analyticsRevenueChart'), {
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
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    },

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};
