import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const StoryManagementPage = {
    stories: [],
    currentPage: 1,
    filters: {},

    async init() {
        await this.loadStories();
        this.setupEventListeners();
    },

    async loadStories(page = 1) {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading stories...');

            const params = {
                page,
                limit: CONFIG.PAGINATION.DEFAULT_LIMIT,
                ...this.filters
            };

            const response = await api.get('/admin/stories', params);
            
            this.stories = response.stories || [];
            this.currentPage = page;

            this.renderStories(response);
        } catch (error) {
            console.error('Error loading stories:', error);
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="color: #1f2937; margin-bottom: 10px;">Failed to Load Stories</h2>
                    <p style="color: #6b7280; margin-bottom: 20px;">${error.message || 'Unable to connect to the server'}</p>
                    <button class="btn btn-primary" onclick="StoryManagementPage.loadStories()">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </div>
            `;
            Utils.showToast('Failed to load stories', 'error');
        }
    },

    renderStories(data) {
        const pageContent = document.getElementById('pageContent');

        pageContent.innerHTML = `
            <div class="story-management-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Traveler Stories Management</h1>
                        <p class="page-subtitle">Review and approve traveler stories before publishing</p>
                    </div>
                </div>

                <!-- Stats Overview -->
                <div class="stats-grid stats-grid-3">
                    ${Components.statCard('Total Stories', Utils.formatNumber(data.stats?.total || 0), 'book-open', null, 'primary')}
                    ${Components.statCard('Pending Review', Utils.formatNumber(data.stats?.pending || 0), 'clock', null, 'warning')}
                    ${Components.statCard('Published', Utils.formatNumber(data.stats?.approved || 0), 'check-circle', null, 'success')}
                </div>

                <!-- Filters -->
                ${Components.filterBar([
                    { type: 'search', key: 'search', placeholder: 'Search stories...' },
                    {
                        type: 'select',
                        key: 'status',
                        placeholder: 'All Status',
                        options: [
                            { value: 'pending', label: 'Pending Review' },
                            { value: 'approved', label: 'Published' }
                        ]
                    }
                ])}

                <!-- Stories Grid -->
                <div class="card">
                    <div class="card-body">
                        ${this.renderStoriesGrid(this.stories)}
                    </div>
                </div>

                <!-- Pagination -->
                <div class="pagination-container">
                    ${Components.pagination(this.currentPage, data.totalPages || 1, (page) => this.loadStories(page))}
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    renderStoriesGrid(stories) {
        if (!stories || stories.length === 0) {
            return Components.emptyState(
                'book-open',
                'No Stories Found',
                'No traveler stories match your current filters'
            );
        }

        return `
            <div class="stories-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
                ${stories.map(story => this.renderStoryCard(story)).join('')}
            </div>
        `;
    },

    renderStoryCard(story) {
        const mediaUrl = story.media && story.media.length > 0 
            ? (typeof story.media[0] === 'string' ? story.media[0] : story.media[0]?.url)
            : null;

        return `
            <div class="story-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
                ${mediaUrl ? `
                    <div style="height: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative;">
                        <img src="${mediaUrl}" alt="${story.title}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="position: absolute; top: 12px; right: 12px;">
                            ${story.isApproved 
                                ? '<span class="badge badge-success"><i class="fas fa-check"></i> Published</span>'
                                : '<span class="badge badge-warning"><i class="fas fa-clock"></i> Pending</span>'
                            }
                        </div>
                    </div>
                ` : `
                    <div style="height: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; position: relative;">
                        <i class="fas fa-image" style="font-size: 48px; color: rgba(255,255,255,0.5);"></i>
                        <div style="position: absolute; top: 12px; right: 12px;">
                            ${story.isApproved 
                                ? '<span class="badge badge-success"><i class="fas fa-check"></i> Published</span>'
                                : '<span class="badge badge-warning"><i class="fas fa-clock"></i> Pending</span>'
                            }
                        </div>
                    </div>
                `}
                
                <div style="padding: 20px;">
                    <h3 style="margin: 0 0 8px; font-size: 1.1rem; font-weight: 600; color: #1f2937;">${story.title || 'Untitled Story'}</h3>
                    
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                        <img src="${Utils.getAvatarUrl(story.user?.name, story.user?.avatar)}" alt="${story.user?.name}" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span style="font-size: 0.875rem; color: #6b7280;">${story.user?.name || 'Unknown'}</span>
                    </div>
                    
                    <p style="margin: 0 0 12px; font-size: 0.875rem; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${story.story || 'No description'}
                    </p>
                    
                    <div style="display: flex; gap: 16px; margin-bottom: 16px; font-size: 0.75rem; color: #9ca3af;">
                        ${story.location ? `<span><i class="fas fa-map-marker-alt"></i> ${story.location}</span>` : ''}
                        <span><i class="fas fa-heart"></i> ${story.likesCount || 0}</span>
                        <span><i class="fas fa-comment"></i> ${story.commentsCount || 0}</span>
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-outline" data-action="view" data-id="${story.id}" style="flex: 1;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${!story.isApproved ? `
                            <button class="btn btn-sm btn-success" data-action="approve" data-id="${story.id}" style="flex: 1;">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="reject" data-id="${story.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : `
                            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${story.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const id = e.currentTarget.dataset.id;

                switch (action) {
                    case 'view':
                        this.viewStory(id);
                        break;
                    case 'approve':
                        this.approveStory(id);
                        break;
                    case 'reject':
                        this.rejectStory(id);
                        break;
                    case 'delete':
                        this.deleteStory(id);
                        break;
                }
            });
        });

        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.loadStories(page);
                }
            });
        });
    },

    setupEventListeners() {
        document.addEventListener('change', (e) => {
            if (e.target.dataset.filter) {
                this.filters[e.target.dataset.filter] = e.target.value;
                this.loadStories(1);
            }
        });

        document.addEventListener('input', Utils.debounce((e) => {
            if (e.target.dataset.filter === 'search') {
                this.filters.search = e.target.value;
                this.loadStories(1);
            }
        }, 500));

        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-reset')) {
                this.filters = {};
                document.querySelectorAll('[data-filter]').forEach(input => {
                    input.value = '';
                });
                this.loadStories(1);
            }
        });
    },

    viewStory(id) {
        const story = this.stories.find(s => s.id == id);
        if (story) {
            this.showStoryDetailsModal(story);
        }
    },

    showStoryDetailsModal(story) {
        const mediaUrl = story.media && story.media.length > 0 
            ? (typeof story.media[0] === 'string' ? story.media[0] : story.media[0]?.url)
            : null;

        const content = `
            <div class="story-details">
                ${mediaUrl ? `
                    <div style="margin: -20px -20px 20px; height: 250px;">
                        <img src="${mediaUrl}" alt="${story.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                ` : ''}
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <img src="${Utils.getAvatarUrl(story.user?.name, story.user?.avatar)}" alt="${story.user?.name}" style="width: 48px; height: 48px; border-radius: 50%;">
                    <div>
                        <h4 style="margin: 0; font-size: 1rem;">${story.user?.name || 'Unknown'}</h4>
                        <p style="margin: 4px 0 0; font-size: 0.875rem; color: #6b7280;">${story.user?.email || ''}</p>
                    </div>
                    ${story.isApproved 
                        ? '<span class="badge badge-success" style="margin-left: auto;"><i class="fas fa-check"></i> Published</span>'
                        : '<span class="badge badge-warning" style="margin-left: auto;"><i class="fas fa-clock"></i> Pending Review</span>'
                    }
                </div>
                
                <h3 style="margin: 0 0 12px; font-size: 1.25rem;">${story.title || 'Untitled Story'}</h3>
                
                <div style="display: flex; gap: 16px; margin-bottom: 16px; font-size: 0.875rem; color: #6b7280;">
                    ${story.location ? `<span><i class="fas fa-map-marker-alt"></i> ${story.location}</span>` : ''}
                    ${story.duration ? `<span><i class="fas fa-clock"></i> ${story.duration}</span>` : ''}
                </div>
                
                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin: 0; line-height: 1.6; color: #374151;">${story.story || 'No content'}</p>
                </div>
                
                ${story.highlights && story.highlights.length > 0 ? `
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px; font-size: 0.875rem; color: #6b7280;">Highlights:</h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${story.highlights.map(h => `<span class="badge badge-primary">${h}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280;">
                    <span><i class="fas fa-heart"></i> ${story.likesCount || 0} likes</span>
                    <span><i class="fas fa-comment"></i> ${story.commentsCount || 0} comments</span>
                    <span><i class="fas fa-calendar"></i> ${Utils.formatDate(story.createdAt)}</span>
                </div>
            </div>
        `;

        const modal = Components.modal('storyDetailsModal', 'Story Details', content, `
            <button class="btn btn-outline modal-close-btn">Close</button>
            ${!story.isApproved ? `
                <button class="btn btn-danger" onclick="StoryManagementPage.rejectStory('${story.id}')">Reject</button>
                <button class="btn btn-success" onclick="StoryManagementPage.approveStory('${story.id}')">Approve & Publish</button>
            ` : `
                <button class="btn btn-danger" onclick="StoryManagementPage.deleteStory('${story.id}')">Delete Story</button>
            `}
        `);

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modal;

        modalContainer.querySelector('.modal-close').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
        modalContainer.querySelector('.modal-close-btn').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
    },

    async approveStory(id) {
        Utils.showConfirm(
            'Approve Story',
            'Are you sure you want to approve and publish this story? It will be visible to all travelers.',
            async () => {
                try {
                    await api.post(`/admin/stories/${id}/approve`);
                    Utils.showToast('Story approved and published successfully', 'success');
                    document.getElementById('modalContainer').innerHTML = '';
                    this.loadStories(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to approve story', 'error');
                }
            }
        );
    },

    async rejectStory(id) {
        Utils.showConfirm(
            'Reject Story',
            'Are you sure you want to reject this story? It will not be published.',
            async () => {
                try {
                    await api.post(`/admin/stories/${id}/reject`);
                    Utils.showToast('Story rejected successfully', 'success');
                    document.getElementById('modalContainer').innerHTML = '';
                    this.loadStories(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to reject story', 'error');
                }
            }
        );
    },

    async deleteStory(id) {
        Utils.showConfirm(
            'Delete Story',
            'Are you sure you want to permanently delete this story? This action cannot be undone.',
            async () => {
                try {
                    await api.delete(`/admin/stories/${id}`);
                    Utils.showToast('Story deleted successfully', 'success');
                    document.getElementById('modalContainer').innerHTML = '';
                    this.loadStories(this.currentPage);
                } catch (error) {
                    Utils.showToast('Failed to delete story', 'error');
                }
            }
        );
    },

    destroy() {}
};

// Make it globally accessible
window.StoryManagementPage = StoryManagementPage;
