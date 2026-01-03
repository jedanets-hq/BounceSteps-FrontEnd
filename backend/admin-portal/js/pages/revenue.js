import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const RevenuePage = {
    revenueData: null,
    period: 'month',

    async init() {
        await this.loadRevenue();
    },

    async loadRevenue() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading revenue data...');

            const response = await api.getRevenue({ period: this.period });
            this.revenueData = response.revenue || {};
            this.renderRevenue();
        } catch (error) {
            console.error('Error loading revenue:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Revenue</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="RevenuePage.loadRevenue()">Try Again</button>
                </div>
            `;
        }
    },

    renderRevenue() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="revenue-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Revenue</h1>
                        <p class="page-subtitle">Track revenue and earnings</p>
                    </div>
                    <div class="page-actions">
                        <select id="periodSelect" class="form-select" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--color-border);">
                            <option value="today" ${this.period === 'today' ? 'selected' : ''}>Today</option>
                            <option value="week" ${this.period === 'week' ? 'selected' : ''}>This Week</option>
                            <option value="month" ${this.period === 'month' ? 'selected' : ''}>This Month</option>
                            <option value="year" ${this.period === 'year' ? 'selected' : ''}>This Year</option>
                        </select>
                    </div>
                </div>
                <div class="stats-grid stats-grid-3">
                    ${Components.statCard('Total Revenue', Utils.formatCurrency(this.revenueData.total || 0), 'dollar-sign', null, 'success')}
                    ${Components.statCard('Period', this.period.charAt(0).toUpperCase() + this.period.slice(1), 'calendar', null, 'primary')}
                    ${Components.statCard('Categories', (this.revenueData.byCategory || []).length, 'tags', null, 'accent')}
                </div>
                <div class="dashboard-row">
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Revenue by Category</h3>
                            </div>
                            <div class="card-body">
                                ${this.renderCategoryRevenue()}
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-col-6">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Daily Revenue</h3>
                            </div>
                            <div class="card-body">
                                ${this.renderDailyRevenue()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.attachEventListeners();
    },

    renderCategoryRevenue() {
        const categories = this.revenueData.byCategory || [];
        if (categories.length === 0) {
            return '<p style="color: var(--color-muted-foreground);">No category data available</p>';
        }

        return `
            <div class="category-revenue">
                ${categories.map(cat => `
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--color-border);">
                        <span>${cat.category}</span>
                        <strong>${Utils.formatCurrency(cat.revenue)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderDailyRevenue() {
        const daily = this.revenueData.daily || [];
        if (daily.length === 0) {
            return '<p style="color: var(--color-muted-foreground);">No daily data available</p>';
        }

        return `
            <div class="daily-revenue">
                ${daily.slice(-10).map(day => `
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--color-border);">
                        <span>${Utils.formatDate(day.date)}</span>
                        <strong>${Utils.formatCurrency(day.revenue)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    },

    attachEventListeners() {
        document.getElementById('periodSelect')?.addEventListener('change', (e) => {
            this.period = e.target.value;
            this.loadRevenue();
        });
    },

    destroy() {}
};
