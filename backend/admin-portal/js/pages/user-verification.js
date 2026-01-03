import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';

export const UserVerificationPage = {
    async init() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">User Verification</h1>
                    <p class="page-subtitle">Verify user accounts</p>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    ${Components.emptyState('user-check', 'No Pending Verifications', 'All users have been verified')}
                </div>
            </div>
        `;
    },
    destroy() {}
};
