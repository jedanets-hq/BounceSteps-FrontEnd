import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';

export const CategoriesPage = {
    categories: [],

    async init() {
        await this.loadCategories();
    },

    async loadCategories() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading categories...');

            const response = await api.getCategories();
            this.categories = response.categories || [];
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Categories</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="CategoriesPage.loadCategories()">Try Again</button>
                </div>
            `;
        }
    },

    renderCategories() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="categories-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Service Categories</h1>
                        <p class="page-subtitle">Manage service categories</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div class="categories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                            ${this.categories.length > 0 ? this.categories.map(cat => `
                                <div class="category-card" style="padding: 20px; background: var(--color-card); border-radius: 8px; border: 1px solid var(--color-border);">
                                    <h3 style="margin: 0 0 8px 0;">${cat.name || cat.id}</h3>
                                    <p style="color: var(--color-muted-foreground); margin: 0;">${cat.count || 0} services</p>
                                </div>
                            `).join('') : '<p>No categories found</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    destroy() {}
};
