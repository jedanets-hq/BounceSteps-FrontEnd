import { Components } from '../components.js';

export const ActivityLogsPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Activity Logs</h1>
                    <p class="page-subtitle">View system activity</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('history', 'Activity Logs', 'No activity logs to display')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
