import { Components } from '../components.js';

export const AdminsPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Admin Users</h1>
                    <p class="page-subtitle">Manage admin accounts</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('user-shield', 'Admin Users', 'Admin management coming soon')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
