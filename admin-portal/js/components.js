/**
 * iSafari Admin Portal - Reusable Components
 */

import { Utils } from './utils.js';

export const Components = {
    /**
     * Create stat card
     */
    statCard(title, value, icon, trend = null, color = 'primary') {
        const trendHTML = trend ? `
            <div class="stat-trend ${trend.direction}">
                <i class="fas fa-arrow-${trend.direction === 'up' ? 'up' : 'down'}"></i>
                ${trend.value}%
            </div>
        ` : '';

        return `
            <div class="stat-card stat-card-${color}">
                <div class="stat-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-title">${title}</div>
                    <div class="stat-value">${value}</div>
                    ${trendHTML}
                </div>
            </div>
        `;
    },

    /**
     * Create data table
     */
    dataTable(columns, data, actions = null) {
        const headerHTML = columns.map(col => `
            <th class="${col.sortable ? 'sortable' : ''}" data-key="${col.key}">
                ${col.label}
                ${col.sortable ? '<i class="fas fa-sort"></i>' : ''}
            </th>
        `).join('');

        const rowsHTML = data.map(row => {
            const cellsHTML = columns.map(col => {
                let value = row[col.key];

                // Apply formatter if exists
                if (col.formatter) {
                    value = col.formatter(value, row);
                }

                return `<td>${value || '-'}</td>`;
            }).join('');

            const actionsHTML = actions ? `
                <td class="table-actions">
                    ${actions.map(action => `
                        <button class="btn-icon btn-icon-${action.type}" 
                                data-action="${action.name}" 
                                data-id="${row.id}"
                                title="${action.label}">
                            <i class="fas fa-${action.icon}"></i>
                        </button>
                    `).join('')}
                </td>
            ` : '';

            return `<tr data-id="${row.id}">${cellsHTML}${actionsHTML}</tr>`;
        }).join('');

        return `
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headerHTML}
                            ${actions ? '<th class="actions-column">Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML || '<tr><td colspan="100%" class="no-data">No data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Create pagination
     */
    pagination(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return '';

        const pages = [];
        const maxVisible = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return `
            <div class="pagination">
                <button class="pagination-btn" 
                        data-page="${currentPage - 1}" 
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${startPage > 1 ? `
                    <button class="pagination-btn" data-page="1">1</button>
                    ${startPage > 2 ? '<span class="pagination-dots">...</span>' : ''}
                ` : ''}
                
                ${pages.map(page => `
                    <button class="pagination-btn ${page === currentPage ? 'active' : ''}" 
                            data-page="${page}">
                        ${page}
                    </button>
                `).join('')}
                
                ${endPage < totalPages ? `
                    ${endPage < totalPages - 1 ? '<span class="pagination-dots">...</span>' : ''}
                    <button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>
                ` : ''}
                
                <button class="pagination-btn" 
                        data-page="${currentPage + 1}" 
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    },

    /**
     * Create filter bar
     */
    filterBar(filters) {
        return `
            <div class="filter-bar">
                ${filters.map(filter => {
            if (filter.type === 'search') {
                return `
                            <div class="filter-item filter-search">
                                <i class="fas fa-search"></i>
                                <input type="text" 
                                       placeholder="${filter.placeholder}" 
                                       data-filter="${filter.key}">
                            </div>
                        `;
            } else if (filter.type === 'select') {
                return `
                            <div class="filter-item filter-select">
                                <select data-filter="${filter.key}">
                                    <option value="">${filter.placeholder}</option>
                                    ${filter.options.map(opt => `
                                        <option value="${opt.value}">${opt.label}</option>
                                    `).join('')}
                                </select>
                            </div>
                        `;
            } else if (filter.type === 'date') {
                return `
                            <div class="filter-item filter-date">
                                <input type="date" 
                                       placeholder="${filter.placeholder}" 
                                       data-filter="${filter.key}">
                            </div>
                        `;
            }
        }).join('')}
                
                <button class="btn btn-outline filter-reset">
                    <i class="fas fa-redo"></i>
                    Reset
                </button>
            </div>
        `;
    },

    /**
     * Create chart container
     */
    chartContainer(id, title, type = 'line') {
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <h3 class="chart-title">${title}</h3>
                    <div class="chart-controls">
                        <select class="chart-period" data-chart="${id}">
                            <option value="7">Last 7 days</option>
                            <option value="30" selected>Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>
                </div>
                <div class="chart-body">
                    <canvas id="${id}"></canvas>
                </div>
            </div>
        `;
    },

    /**
     * Create user card
     */
    userCard(user) {
        return `
            <div class="user-card" data-id="${user.id}">
                <div class="user-card-header">
                    <img src="${Utils.getAvatarUrl(user.name, user.avatar)}" 
                         alt="${user.name}" 
                         class="user-avatar">
                    <div class="user-info">
                        <h4 class="user-name">${user.name}</h4>
                        <p class="user-email">${user.email}</p>
                    </div>
                </div>
                <div class="user-card-body">
                    <div class="user-meta">
                        <div class="user-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Joined ${Utils.formatDate(user.createdAt)}</span>
                        </div>
                        ${user.phone ? `
                            <div class="user-meta-item">
                                <i class="fas fa-phone"></i>
                                <span>${Utils.formatPhone(user.phone)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="user-badges">
                        ${Utils.getRoleBadge(user.role)}
                        ${Utils.getStatusBadge(user.status)}
                    </div>
                </div>
                <div class="user-card-footer">
                    <button class="btn btn-sm btn-outline" data-action="view" data-id="${user.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${user.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Create service card
     */
    serviceCard(service) {
        return `
            <div class="service-card" data-id="${service.id}">
                <div class="service-image">
                    <img src="${service.images?.[0] || '/placeholder-service.jpg'}" 
                         alt="${service.title}">
                    ${service.featured ? '<span class="service-featured"><i class="fas fa-star"></i> Featured</span>' : ''}
                </div>
                <div class="service-content">
                    <div class="service-header">
                        <h4 class="service-title">${Utils.truncate(service.title, 40)}</h4>
                        <span class="service-price">${Utils.formatCurrency(service.price)}</span>
                    </div>
                    <p class="service-description">${Utils.truncate(service.description, 80)}</p>
                    <div class="service-meta">
                        <span class="service-category">
                            <i class="fas fa-tag"></i>
                            ${service.category}
                        </span>
                        <span class="service-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${service.location}
                        </span>
                    </div>
                    <div class="service-footer">
                        <div class="service-provider">
                            <img src="${Utils.getAvatarUrl(service.provider?.name)}" 
                                 alt="${service.provider?.name}" 
                                 class="provider-avatar">
                            <span>${service.provider?.name}</span>
                        </div>
                        ${Utils.getStatusBadge(service.status)}
                    </div>
                </div>
                <div class="service-actions">
                    <button class="btn btn-sm btn-outline" data-action="view" data-id="${service.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${service.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" data-action="approve" data-id="${service.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-action="reject" data-id="${service.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-primary" data-action="edit" data-id="${service.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Create booking card
     */
    bookingCard(booking) {
        return `
            <div class="booking-card" data-id="${booking.id}">
                <div class="booking-header">
                    <div class="booking-id">#${booking.id.substring(0, 8)}</div>
                    ${Utils.getStatusBadge(booking.status)}
                </div>
                <div class="booking-content">
                    <div class="booking-service">
                        <h4>${booking.service?.title}</h4>
                        <p class="booking-category">
                            <i class="fas fa-tag"></i>
                            ${booking.service?.category}
                        </p>
                    </div>
                    <div class="booking-details">
                        <div class="booking-detail">
                            <i class="fas fa-user"></i>
                            <span>${booking.traveler?.name}</span>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-calendar"></i>
                            <span>${Utils.formatDate(booking.date)}</span>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-users"></i>
                            <span>${booking.guests} guest${booking.guests > 1 ? 's' : ''}</span>
                        </div>
                        <div class="booking-detail">
                            <i class="fas fa-money-bill"></i>
                            <span>${Utils.formatCurrency(booking.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-footer">
                    <button class="btn btn-sm btn-outline" data-action="view" data-id="${booking.id}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${booking.status === 'pending' ? `
                        <button class="btn btn-sm btn-danger" data-action="cancel" data-id="${booking.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Create activity log item
     */
    activityLogItem(log) {
        const iconMap = {
            'user_created': 'user-plus',
            'user_updated': 'user-edit',
            'user_deleted': 'user-times',
            'service_created': 'plus-circle',
            'service_approved': 'check-circle',
            'service_rejected': 'times-circle',
            'booking_created': 'calendar-plus',
            'payment_processed': 'credit-card'
        };

        return `
            <div class="activity-log-item">
                <div class="activity-icon">
                    <i class="fas fa-${iconMap[log.action] || 'circle'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-header">
                        <span class="activity-user">${log.user?.name || 'System'}</span>
                        <span class="activity-action">${log.action.replace(/_/g, ' ')}</span>
                    </div>
                    <div class="activity-description">${log.description}</div>
                    <div class="activity-time">${Utils.timeAgo(log.createdAt)}</div>
                </div>
            </div>
        `;
    },

    /**
     * Create empty state
     */
    emptyState(icon, title, message, actionButton = null) {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <h3 class="empty-title">${title}</h3>
                <p class="empty-message">${message}</p>
                ${actionButton ? `
                    <button class="btn btn-primary" data-action="${actionButton.action}">
                        <i class="fas fa-${actionButton.icon}"></i>
                        ${actionButton.label}
                    </button>
                ` : ''}
            </div>
        `;
    },

    /**
     * Create loading spinner
     */
    loadingSpinner(message = 'Loading...') {
        return `
            <div class="loading-spinner">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Create modal
     */
    modal(id, title, content, footer = null, size = 'medium') {
        return `
            <div class="modal-overlay" id="${id}">
                <div class="modal modal-${size}">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${footer ? `
                        <div class="modal-footer">
                            ${footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Create form field
     */
    formField(config) {
        const { type, name, label, placeholder, required, value, options } = config;

        let inputHTML = '';

        if (type === 'select') {
            inputHTML = `
                <select name="${name}" ${required ? 'required' : ''}>
                    <option value="">${placeholder || 'Select...'}</option>
                    ${options.map(opt => `
                        <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            `;
        } else if (type === 'textarea') {
            inputHTML = `
                <textarea name="${name}" 
                          placeholder="${placeholder || ''}" 
                          ${required ? 'required' : ''}>${value || ''}</textarea>
            `;
        } else {
            inputHTML = `
                <input type="${type}" 
                       name="${name}" 
                       placeholder="${placeholder || ''}" 
                       value="${value || ''}" 
                       ${required ? 'required' : ''}>
            `;
        }

        return `
            <div class="form-field">
                <label for="${name}">
                    ${label}
                    ${required ? '<span class="required">*</span>' : ''}
                </label>
                ${inputHTML}
            </div>
        `;
    }
};
