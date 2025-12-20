import { Components } from '../components.js';

export const SupportPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Support Tickets</h1>
                    <p class="page-subtitle">Manage customer support</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('headset', 'Support Tickets', 'No open support tickets')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
