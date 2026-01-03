/**
 * iSafari Admin Portal - Main Application
 * Handles routing, navigation, and page management
 */

import { CONFIG } from './config.js';
import { api } from './api.js';
import { Utils } from './utils.js';
import { Components } from './components.js';

// Import Pages
import { DashboardPage } from './pages/dashboard.js';
import { UsersPage } from './pages/users.js';
import { TravelersPage } from './pages/travelers.js';
import { ProvidersPage } from './pages/providers.js';
import { ServicesPage } from './pages/services.js';
import { ServiceApprovalPage } from './pages/service-approval.js';
import { BookingsPage } from './pages/bookings.js';
import { PaymentsPage } from './pages/payments.js';
import { AnalyticsPage } from './pages/analytics.js';
import { SettingsPage } from './pages/settings.js';
import { CategoriesPage } from './pages/categories.js';
import { DestinationsPage } from './pages/destinations.js';
import { PreOrdersPage } from './pages/pre-orders.js';
import { BookingCalendarPage } from './pages/booking-calendar.js';
import { TransactionsPage } from './pages/transactions.js';
import { RevenuePage } from './pages/revenue.js';
import { PayoutsPage } from './pages/payouts.js';
import { UserVerificationPage } from './pages/user-verification.js';
import { ContentPage } from './pages/content.js';
import { PromotionsPage } from './pages/promotions.js';
import { ReviewsPage } from './pages/reviews.js';
import { NotificationsPage } from './pages/notifications.js';
import { SupportPage } from './pages/support.js';
import { FeedbackPage } from './pages/feedback.js';
import { ActivityLogsPage } from './pages/activity-logs.js';
import { ReportsPage } from './pages/reports.js';
import { AdminsPage } from './pages/admins.js';
import { SystemHealthPage } from './pages/system-health.js';
import { TrustedPartnersPage } from './pages/trusted-partners.js';
import { ProviderVerificationPage } from './pages/provider-verification.js';
import { StoryManagementPage } from './pages/story-management.js';

export class AdminApp {
    constructor() {
        this.currentPage = null;
        this.pages = {
            'dashboard': DashboardPage,
            'analytics': AnalyticsPage,
            'users': UsersPage,
            'travelers': TravelersPage,
            'providers': ProvidersPage,
            'services': ServicesPage,
            'service-approval': ServiceApprovalPage,
            'bookings': BookingsPage,
            'payments': PaymentsPage,
            'settings': SettingsPage,
            'categories': CategoriesPage,
            'destinations': DestinationsPage,
            'pre-orders': PreOrdersPage,
            'booking-calendar': BookingCalendarPage,
            'transactions': TransactionsPage,
            'revenue': RevenuePage,
            'payouts': PayoutsPage,
            'user-verification': UserVerificationPage,
            'content': ContentPage,
            'promotions': PromotionsPage,
            'reviews': ReviewsPage,
            'notifications': NotificationsPage,
            'support': SupportPage,
            'feedback': FeedbackPage,
            'activity-logs': ActivityLogsPage,
            'reports': ReportsPage,
            'admins': AdminsPage,
            'system-health': SystemHealthPage,
            'trusted-partners': TrustedPartnersPage,
            'provider-verification': ProviderVerificationPage,
            'story-management': StoryManagementPage
        };
    }

    async init() {
        // No authentication required - direct access to admin portal

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
        }, 1000);

        // Setup navigation
        this.setupNavigation();
        this.setupSidebar();
        this.setupTheme();

        // Load initial page
        const hash = window.location.hash.substring(1) || 'dashboard';
        await this.navigateTo(hash);

        // Update sidebar stats
        await this.updateStats();

        // Setup hash change listener
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'dashboard';
            this.navigateTo(page);
        });
    }

    setupNavigation() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    window.location.hash = page;
                }
            });
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            Utils.showConfirm(
                'Logout',
                'Are you sure you want to logout?',
                async () => {
                    await api.logout();
                    window.location.reload();
                }
            );
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');

        // Desktop sidebar toggle
        sidebarToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem(CONFIG.STORAGE_KEYS.SIDEBAR_STATE,
                sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded'
            );
        });

        // Mobile sidebar toggle
        mobileSidebarToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !mobileSidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });

        // Restore sidebar state
        const savedState = localStorage.getItem(CONFIG.STORAGE_KEYS.SIDEBAR_STATE);
        if (savedState === 'collapsed') {
            sidebar.classList.add('collapsed');
        }
    }

    setupTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);

        const themeToggle = document.getElementById('themeToggle');
        themeToggle.innerHTML = newTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    async navigateTo(pageName) {
        // Destroy current page
        if (this.currentPage && this.currentPage.destroy) {
            this.currentPage.destroy();
        }

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Update breadcrumb
        const breadcrumbText = document.getElementById('breadcrumbText');
        if (breadcrumbText) {
            breadcrumbText.textContent = this.formatPageName(pageName);
        }

        // Load page
        const PageClass = this.pages[pageName];
        if (PageClass) {
            this.currentPage = PageClass;
            try {
                await PageClass.init();
            } catch (error) {
                console.error(`Error loading page ${pageName}:`, error);
                this.showErrorPage();
            }
        } else {
            this.show404Page();
        }
    }

    formatPageName(pageName) {
        return pageName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    showErrorPage() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = Components.emptyState(
            'exclamation-triangle',
            'Error Loading Page',
            'Something went wrong. Please try again.',
            { action: 'reload', icon: 'redo', label: 'Reload Page' }
        );

        document.querySelector('[data-action="reload"]')?.addEventListener('click', () => {
            window.location.reload();
        });
    }

    show404Page() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = Components.emptyState(
            'map-marked-alt',
            'Page Not Found',
            'The page you are looking for does not exist.',
            { action: 'home', icon: 'home', label: 'Go to Dashboard' }
        );

        document.querySelector('[data-action="home"]')?.addEventListener('click', () => {
            window.location.hash = 'dashboard';
        });
    }

    async updateStats() {
        try {
            // Update sidebar counts from user stats
            const userResponse = await api.getUserStats();
            const userStats = userResponse.stats || userResponse;
            document.getElementById('totalUsersCount').textContent = userStats.total || 0;
            document.getElementById('travelersCount').textContent = userStats.travelers || 0;
            document.getElementById('providersCount').textContent = userStats.providers || 0;

            // Update service stats
            const serviceResponse = await api.getServiceStats();
            const serviceStats = serviceResponse.stats || serviceResponse;
            document.getElementById('totalServicesCount').textContent = serviceStats.total || 0;
            document.getElementById('pendingServicesCount').textContent = serviceStats.pending || 0;

            // Update booking stats
            const bookingResponse = await api.getBookingStats();
            const bookingStats = bookingResponse.stats || bookingResponse;
            document.getElementById('totalBookingsCount').textContent = bookingStats.total || 0;
            document.getElementById('preOrdersCount').textContent = bookingStats.pending || 0;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }
}
