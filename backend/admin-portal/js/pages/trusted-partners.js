/**
 * Trusted Partners Management Page
 */

import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';

export const TrustedPartnersPage = {
    partners: [],
    
    async init() {
        this.render();
        await this.loadPartners();
        this.setupEventListeners();
    },

    render() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="page-header">
                <div class="page-header-content">
                    <h1 class="page-title">
                        <i class="fas fa-handshake"></i>
                        Trusted Partners
                    </h1>
                    <p class="page-description">Manage trusted partners displayed on the homepage</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" id="addPartnerBtn">
                        <i class="fas fa-plus"></i>
                        Add Partner
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div id="partnersGrid" class="partners-grid">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            Loading partners...
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add/Edit Partner Modal -->
            <div class="modal" id="partnerModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Add Trusted Partner</h3>
                        <button class="modal-close" id="closeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="partnerForm">
                            <input type="hidden" id="partnerId">
                            <div class="form-group">
                                <label for="partnerName">Partner Name *</label>
                                <input type="text" id="partnerName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="partnerType">Partner Type *</label>
                                <select id="partnerType" class="form-control" required>
                                    <option value="">Select Type</option>
                                    <option value="Luxury Hotels">Luxury Hotels</option>
                                    <option value="Premium Airlines">Premium Airlines</option>
                                    <option value="Cultural Institutions">Cultural Institutions</option>
                                    <option value="Cultural Partners">Cultural Partners</option>
                                    <option value="Tour Operators">Tour Operators</option>
                                    <option value="Travel Agencies">Travel Agencies</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="partnerLogo">Logo URL</label>
                                <input type="url" id="partnerLogo" class="form-control" placeholder="https://...">
                            </div>
                            <div class="form-group">
                                <label for="partnerWebsite">Website</label>
                                <input type="url" id="partnerWebsite" class="form-control" placeholder="https://...">
                            </div>
                            <div class="form-group">
                                <label for="partnerDescription">Description</label>
                                <textarea id="partnerDescription" class="form-control" rows="3"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        <button class="btn btn-primary" id="savePartnerBtn">Save Partner</button>
                    </div>
                </div>
            </div>
        `;
    },

    async loadPartners() {
        try {
            const response = await api.get('/admin/trusted-partners');
            this.partners = response.partners || [];
            this.renderPartners();
        } catch (error) {
            console.error('Error loading partners:', error);
            this.partners = [];
            this.renderPartners();
        }
    },

    renderPartners() {
        const grid = document.getElementById('partnersGrid');
        
        if (this.partners.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-handshake"></i>
                    <h3>No Trusted Partners Yet</h3>
                    <p>Add your first trusted partner to display on the homepage</p>
                    <button class="btn btn-primary" id="emptyAddBtn">
                        <i class="fas fa-plus"></i>
                        Add Partner
                    </button>
                </div>
            `;
            document.getElementById('emptyAddBtn')?.addEventListener('click', () => this.openModal());
            return;
        }

        grid.innerHTML = this.partners.map(partner => `
            <div class="partner-card" data-id="${partner.id}">
                <div class="partner-logo">
                    ${partner.logo 
                        ? `<img src="${partner.logo}" alt="${partner.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2264%22 height=%2264%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3E${partner.name.charAt(0)}%3C/text%3E%3C/svg%3E'">`
                        : `<div class="partner-placeholder">${partner.name.charAt(0)}</div>`
                    }
                </div>
                <div class="partner-info">
                    <h4>${partner.name}</h4>
                    <span class="partner-type">${partner.type || 'Partner'}</span>
                    ${partner.description ? `<p class="partner-desc">${partner.description}</p>` : ''}
                </div>
                <div class="partner-actions">
                    <button class="btn btn-sm btn-outline edit-btn" data-id="${partner.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${partner.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        grid.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editPartner(id);
            });
        });

        grid.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deletePartner(id);
            });
        });
    },

    setupEventListeners() {
        document.getElementById('addPartnerBtn')?.addEventListener('click', () => this.openModal());
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('savePartnerBtn')?.addEventListener('click', () => this.savePartner());
    },

    openModal(partner = null) {
        const modal = document.getElementById('partnerModal');
        const title = document.getElementById('modalTitle');
        
        if (partner) {
            title.textContent = 'Edit Trusted Partner';
            document.getElementById('partnerId').value = partner.id;
            document.getElementById('partnerName').value = partner.name || '';
            document.getElementById('partnerType').value = partner.type || '';
            document.getElementById('partnerLogo').value = partner.logo || '';
            document.getElementById('partnerWebsite').value = partner.website || '';
            document.getElementById('partnerDescription').value = partner.description || '';
        } else {
            title.textContent = 'Add Trusted Partner';
            document.getElementById('partnerForm').reset();
            document.getElementById('partnerId').value = '';
        }
        
        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('partnerModal').classList.remove('active');
    },

    async savePartner() {
        const id = document.getElementById('partnerId').value;
        const data = {
            name: document.getElementById('partnerName').value,
            type: document.getElementById('partnerType').value,
            logo: document.getElementById('partnerLogo').value,
            website: document.getElementById('partnerWebsite').value,
            description: document.getElementById('partnerDescription').value,
            is_active: true
        };

        if (!data.name || !data.type) {
            Utils.showToast('Please fill in required fields', 'error');
            return;
        }

        try {
            if (id) {
                await api.put(`/admin/trusted-partners/${id}`, data);
                Utils.showToast('Partner updated successfully', 'success');
            } else {
                await api.post('/admin/trusted-partners', data);
                Utils.showToast('Partner added successfully', 'success');
            }
            
            this.closeModal();
            await this.loadPartners();
        } catch (error) {
            console.error('Error saving partner:', error);
            Utils.showToast('Error saving partner', 'error');
        }
    },

    editPartner(id) {
        const partner = this.partners.find(p => p.id == id);
        if (partner) {
            this.openModal(partner);
        }
    },

    async deletePartner(id) {
        Utils.showConfirm(
            'Delete Partner',
            'Are you sure you want to delete this partner?',
            async () => {
                try {
                    await api.delete(`/admin/trusted-partners/${id}`);
                    Utils.showToast('Partner deleted successfully', 'success');
                    await this.loadPartners();
                } catch (error) {
                    console.error('Error deleting partner:', error);
                    Utils.showToast('Error deleting partner', 'error');
                }
            }
        );
    },

    destroy() {
        // Cleanup if needed
    }
};
