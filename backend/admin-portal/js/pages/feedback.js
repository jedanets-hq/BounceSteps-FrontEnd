import { Components } from '../components.js';

export const FeedbackPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Feedback</h1>
                    <p class="page-subtitle">View user feedback</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('comments', 'Feedback', 'No feedback to display')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
