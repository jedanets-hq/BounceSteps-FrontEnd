import { Components } from '../components.js';

export const ContentPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Content Management</h1>
                    <p class="page-subtitle">Manage website content</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('file-alt', 'Content Management', 'Content management features coming soon')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
