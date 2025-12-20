import { UsersPage } from './users.js';

// Travelers Page
export const TravelersPage = { async init() { await UsersPage.init(); UsersPage.filters = { role: 'traveler' }; await UsersPage.loadUsers(); }, destroy() { UsersPage.destroy(); } };

// Providers Page  
const ProvidersPage = { async init() { await UsersPage.init(); UsersPage.filters = { role: 'service_provider' }; await UsersPage.loadUsers(); }, destroy() { UsersPage.destroy(); } };
