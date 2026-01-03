import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';

export const BookingCalendarPage = {
    events: [],
    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear(),

    async init() {
        await this.loadCalendar();
    },

    async loadCalendar() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading calendar...');

            const response = await api.getBookingCalendar({ 
                month: this.currentMonth, 
                year: this.currentYear 
            });
            this.events = response.events || [];
            this.renderCalendar(response);
        } catch (error) {
            console.error('Error loading calendar:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Failed to Load Calendar</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="BookingCalendarPage.loadCalendar()">Try Again</button>
                </div>
            `;
        }
    },

    renderCalendar(data) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="calendar-page">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Booking Calendar</h1>
                        <p class="page-subtitle">View bookings by date</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-outline" id="prevMonth"><i class="fas fa-chevron-left"></i></button>
                        <span style="padding: 0 16px; font-weight: 600;">${monthNames[this.currentMonth - 1]} ${this.currentYear}</span>
                        <button class="btn btn-outline" id="nextMonth"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
                <div class="card">
                    <div class="card-body">
                        ${this.renderCalendarGrid()}
                    </div>
                </div>
                <div class="card" style="margin-top: 20px;">
                    <div class="card-header">
                        <h3 class="card-title">Bookings This Month</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderEventsList()}
                    </div>
                </div>
            </div>
        `;
        this.attachEventListeners();
    },

    renderCalendarGrid() {
        const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let html = '<div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">';
        
        // Header
        days.forEach(day => {
            html += `<div style="text-align: center; font-weight: 600; padding: 8px; background: var(--color-muted); border-radius: 4px;">${day}</div>`;
        });
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div></div>';
        }
        
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.events.filter(e => e.date && e.date.startsWith(dateStr));
            const hasEvents = dayEvents.length > 0;
            
            html += `
                <div style="text-align: center; padding: 8px; border: 1px solid var(--color-border); border-radius: 4px; ${hasEvents ? 'background: var(--color-primary); color: white;' : ''}">
                    ${day}
                    ${hasEvents ? `<div style="font-size: 10px;">${dayEvents.length} booking${dayEvents.length > 1 ? 's' : ''}</div>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },

    renderEventsList() {
        if (!this.events || this.events.length === 0) {
            return '<p style="color: var(--color-muted-foreground);">No bookings this month</p>';
        }

        return `
            <div class="events-list">
                ${this.events.map(event => `
                    <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--color-border);">
                        <div>
                            <strong>${event.title}</strong>
                            <div style="color: var(--color-muted-foreground); font-size: 14px;">${event.traveler}</div>
                        </div>
                        <div style="text-align: right;">
                            <div>${Utils.formatDate(event.date)}</div>
                            <div>${Utils.getStatusBadge(event.status)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    attachEventListeners() {
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 1) {
                this.currentMonth = 12;
                this.currentYear--;
            }
            this.loadCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 12) {
                this.currentMonth = 1;
                this.currentYear++;
            }
            this.loadCalendar();
        });
    },

    destroy() {}
};
