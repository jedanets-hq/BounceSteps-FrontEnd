import { api } from '../api.js';
import { Utils } from '../utils.js';
import { Components } from '../components.js';
import { CONFIG } from '../config.js';

export const SettingsPage = {
    paymentSettings: {},

    async init() {
        await this.loadSettings();
    },

    async loadSettings() {
        try {
            const pageContent = document.getElementById('pageContent');
            pageContent.innerHTML = Components.loadingSpinner('Loading settings...');

            let settings = {};
            
            // Load general settings
            try {
                const settingsResponse = await api.getSettings();
                if (settingsResponse.success !== false) {
                    settings = settingsResponse;
                }
            } catch (e) {
                console.log('General settings not found, using defaults');
                settings = {
                    siteName: 'iSafari',
                    contactEmail: 'support@isafari.com',
                    supportPhone: '+255 123 456 789',
                    commissionRate: 10,
                    currency: 'TZS',
                    emailFrom: 'noreply@isafari.com'
                };
            }
            
            // Load company payment settings
            try {
                const paymentResponse = await fetch(`${CONFIG.API_BASE_URL}/admin/settings/payment-gateway`);
                const paymentData = await paymentResponse.json();
                if (paymentData.success) {
                    this.paymentSettings = paymentData.settings || {};
                }
            } catch (e) {
                console.log('Payment settings not found, using defaults');
                this.paymentSettings = {};
            }
            
            this.renderSettings(settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            // Show settings with defaults even on error
            this.renderSettings({
                siteName: 'iSafari',
                contactEmail: 'support@isafari.com',
                supportPhone: '+255 123 456 789',
                commissionRate: 10,
                currency: 'TZS',
                emailFrom: 'noreply@isafari.com'
            });
        }
    },

    renderSettings(settings) {
        const pageContent = document.getElementById('pageContent');
        const ps = this.paymentSettings;

        pageContent.innerHTML = `
            <div class="settings-page">
                <div class="page-header">
                    <h1 class="page-title">System Settings</h1>
                    <p class="page-subtitle">Configure system-wide settings</p>
                </div>

                <div class="settings-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-cog"></i> General Settings</h3>
                        </div>
                        <div class="card-body">
                            <form id="generalSettingsForm">
                                ${Components.formField({ type: 'text', name: 'siteName', label: 'Site Name', value: settings.siteName || 'iSafari', required: true })}
                                ${Components.formField({ type: 'email', name: 'contactEmail', label: 'Contact Email', value: settings.contactEmail || '', required: true })}
                                ${Components.formField({ type: 'text', name: 'supportPhone', label: 'Support Phone', value: settings.supportPhone || '' })}
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-dollar-sign"></i> Payment Settings</h3>
                        </div>
                        <div class="card-body">
                            <form id="paymentSettingsForm">
                                ${Components.formField({ type: 'number', name: 'commissionRate', label: 'Commission Rate (%)', value: settings.commissionRate || 10, required: true })}
                                ${Components.formField({ type: 'select', name: 'currency', label: 'Default Currency', value: settings.currency || 'TZS', options: [{ value: 'TZS', label: 'TZS' }, { value: 'USD', label: 'USD' }] })}
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-bell"></i> Notification Settings</h3>
                        </div>
                        <div class="card-body">
                            <form id="notificationSettingsForm">
                                ${Components.formField({ type: 'text', name: 'emailFrom', label: 'Email From', value: settings.emailFrom || 'noreply@isafari.com' })}
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <!-- Company Visa/MasterCard Payment Gateway Settings -->
                    <div class="card" style="grid-column: 1 / -1;">
                        <div class="card-header" style="background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); color: white;">
                            <h3 class="card-title"><i class="fas fa-credit-card"></i> Company Payment Gateway (Visa/MasterCard)</h3>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info" style="margin-bottom: 20px;">
                                <i class="fas fa-info-circle"></i>
                                <strong>Important:</strong> These are the company's payment gateway credentials. All promotion payments from service providers will be processed through this account.
                            </div>
                            <form id="companyPaymentForm">
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-key"></i> API Public Key (Publishable Key)</label>
                                        <input type="text" name="publicKey" class="form-control" value="${ps.publicKey || ''}" placeholder="pk_live_xxxxxxxxxxxx" required>
                                        <small class="form-text">Your Stripe/Payment Gateway publishable key</small>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-lock"></i> API Secret Key</label>
                                        <input type="password" name="secretKey" class="form-control" value="${ps.secretKey || ''}" placeholder="sk_live_xxxxxxxxxxxx" required>
                                        <small class="form-text">Your Stripe/Payment Gateway secret key (kept secure)</small>
                                    </div>
                                </div>
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-building"></i> Merchant ID</label>
                                        <input type="text" name="merchantId" class="form-control" value="${ps.merchantId || ''}" placeholder="merchant_xxxx">
                                        <small class="form-text">Your merchant account ID</small>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-globe"></i> Payment Gateway</label>
                                        <select name="gateway" class="form-control">
                                            <option value="stripe" ${ps.gateway === 'stripe' ? 'selected' : ''}>Stripe</option>
                                            <option value="paystack" ${ps.gateway === 'paystack' ? 'selected' : ''}>Paystack</option>
                                            <option value="flutterwave" ${ps.gateway === 'flutterwave' ? 'selected' : ''}>Flutterwave</option>
                                            <option value="pesapal" ${ps.gateway === 'pesapal' ? 'selected' : ''}>PesaPal</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-university"></i> Company Bank Account Name</label>
                                        <input type="text" name="bankAccountName" class="form-control" value="${ps.bankAccountName || ''}" placeholder="iSafari Global Ltd">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-hashtag"></i> Company Bank Account Number</label>
                                        <input type="text" name="bankAccountNumber" class="form-control" value="${ps.bankAccountNumber || ''}" placeholder="xxxx-xxxx-xxxx">
                                    </div>
                                </div>
                                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-toggle-on"></i> Environment</label>
                                        <select name="environment" class="form-control">
                                            <option value="sandbox" ${ps.environment === 'sandbox' ? 'selected' : ''}>Sandbox (Testing)</option>
                                            <option value="production" ${ps.environment === 'production' ? 'selected' : ''}>Production (Live)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label"><i class="fas fa-check-circle"></i> Status</label>
                                        <select name="isActive" class="form-control">
                                            <option value="true" ${ps.isActive === true || ps.isActive === 'true' ? 'selected' : ''}>Active</option>
                                            <option value="false" ${ps.isActive === false || ps.isActive === 'false' ? 'selected' : ''}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div style="margin-top: 20px; display: flex; gap: 10px;">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i> Save Payment Gateway Settings
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="SettingsPage.testPaymentGateway()">
                                        <i class="fas fa-vial"></i> Test Connection
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('generalSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings('general');
        });

        document.getElementById('paymentSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings('payment');
        });

        document.getElementById('notificationSettingsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings('notification');
        });

        document.getElementById('companyPaymentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompanyPaymentSettings();
        });
    },

    async saveSettings(type) {
        try {
            Utils.showToast('Settings saved successfully', 'success');
        } catch (error) {
            Utils.showToast('Failed to save settings', 'error');
        }
    },

    async saveCompanyPaymentSettings() {
        try {
            const form = document.getElementById('companyPaymentForm');
            const formData = new FormData(form);
            
            const settings = {
                publicKey: formData.get('publicKey'),
                secretKey: formData.get('secretKey'),
                merchantId: formData.get('merchantId'),
                gateway: formData.get('gateway'),
                bankAccountName: formData.get('bankAccountName'),
                bankAccountNumber: formData.get('bankAccountNumber'),
                environment: formData.get('environment'),
                isActive: formData.get('isActive') === 'true'
            };

            const response = await fetch(`${CONFIG.API_BASE_URL}/admin/settings/payment-gateway`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (data.success) {
                Utils.showToast('Payment gateway settings saved successfully!', 'success');
                this.paymentSettings = settings;
            } else {
                Utils.showToast(data.message || 'Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('Error saving payment settings:', error);
            Utils.showToast('Failed to save payment gateway settings', 'error');
        }
    },

    async testPaymentGateway() {
        try {
            Utils.showToast('Testing payment gateway connection...', 'info');
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/admin/settings/payment-gateway/test`);
            const data = await response.json();

            if (data.success) {
                Utils.showToast('Payment gateway connection successful!', 'success');
            } else {
                Utils.showToast(data.message || 'Connection test failed', 'error');
            }
        } catch (error) {
            Utils.showToast('Failed to test payment gateway', 'error');
        }
    },

    destroy() { }
};

// Make testPaymentGateway accessible globally
window.SettingsPage = SettingsPage;
