import { Components } from '../components.js';

export const ReportsPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Reports</h1>
                    <p class="page-subtitle">View reported content</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('flag', 'Reports', 'No reports to display')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
