import { Components } from '../components.js';

export const ReviewsPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Reviews</h1>
                    <p class="page-subtitle">Manage user reviews</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('star', 'Reviews', 'No reviews to display')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
