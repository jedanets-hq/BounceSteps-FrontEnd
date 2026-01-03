import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';

export const DestinationsPage = {
    destinations: [],

    async init() {
        await this.loadDestinations();
    },

    async loadDestinations() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading destinations...');

            const response = await api.getDestinations();
            this.destinations = response.destinations || [];
            this.renderDestinations();
        } catch (error) {
            console.error('Error loading destinations:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Destinations</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="DestinationsPage.loadDestinations()">Try Again</button>
                </div>
            `;
        }
    },

    renderDestinations() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="destinations-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Destinations</h1>
                        <p class="page-subtitle">Manage service destinations</p>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div class="destinations-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
                            ${this.destinations.length > 0 ? this.destinations.map(dest => `
                                <div class="destination-card" style="padding: 20px; background: var(--color-card); border-radius: 8px; border: 1px solid var(--color-border);">
                                    <h3 style="margin: 0 0 8px 0;">${dest.name || dest.id}</h3>
                                    <p style="color: var(--color-muted-foreground); margin: 0;">${dest.region || ''}</p>
                                    <p style="color: var(--color-muted-foreground); margin: 4px 0 0 0;">${dest.count || 0} services</p>
                                </div>
                            `).join('') : '<p>No destinations found</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    destroy() {}
};
