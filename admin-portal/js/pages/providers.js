import { UsersPage } from './users.js';

// Providers Page  
export const ProvidersPage = { async init() { await UsersPage.init(); UsersPage.filters = { role: 'service_provider' }; await UsersPage.loadUsers(); }, destroy() { UsersPage.destroy(); } };
