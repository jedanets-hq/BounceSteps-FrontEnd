import { Components } from '../components.js';

export const NotificationsPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Notifications</h1>
                    <p class="page-subtitle">Manage system notifications</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('bell', 'Notifications', 'No notifications to display')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
