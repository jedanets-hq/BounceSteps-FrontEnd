import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const Financial = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [formData, setFormData] = useState({
    account_type: 'visa_card',
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    card_last_four: '',
    expiry_date: '',
    mobile_number: '',
    is_primary: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/payments/accounts');
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAccount) {
        await api.put(`/admin/payments/accounts/${editingAccount.id}`, formData);
      } else {
        await api.post('/admin/payments/accounts', formData);
      }
      
      setShowAddAccount(false);
      setEditingAccount(null);
      resetForm();
      fetchData();
      alert('Payment account saved successfully!');
    } catch (error) {
      alert('Failed to save payment account');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment account?')) return;
    
    try {
      await api.delete(`/admin/payments/accounts/${id}`);
      fetchData();
      alert('Payment account deleted successfully!');
    } catch (error) {
      alert('Failed to delete payment account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_type: account.account_type,
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      bank_name: account.bank_name || '',
      card_last_four: account.card_last_four || '',
      expiry_date: account.expiry_date || '',
      mobile_number: account.mobile_number || '',
      is_primary: account.is_primary
    });
    setShowAddAccount(true);
  };

  const resetForm = () => {
    setFormData({
      account_type: 'visa_card',
      account_holder_name: '',
      account_number: '',
      bank_name: '',
      card_last_four: '',
      expiry_date: '',
      mobile_number: '',
      is_primary: false
    });
  };

  const getAccountTypeLabel = (type) => {
    const labels = {
      bank_account: 'Bank Account',
      visa_card: 'Visa Card',
      mastercard: 'Mastercard',
      mobile_money: 'Mobile Money'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage payment accounts</p>
      </div>

      {/* Payment Accounts */}
      <div>
          {/* Add Account Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setShowAddAccount(true);
                setEditingAccount(null);
                resetForm();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Payment Account
            </button>
          </div>

          {/* Add/Edit Account Form */}
          {showAddAccount && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingAccount ? 'Edit Payment Account' : 'Add Payment Account'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Type
                    </label>
                    <select
                      value={formData.account_type}
                      onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="visa_card">Visa Card</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="bank_account">Bank Account</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.account_holder_name}
                      onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account/Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {(formData.account_type === 'visa_card' || formData.account_type === 'mastercard') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last 4 Digits
                        </label>
                        <input
                          type="text"
                          maxLength="4"
                          value={formData.card_last_four}
                          onChange={(e) => setFormData({ ...formData, card_last_four: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date (MM/YYYY)
                        </label>
                        <input
                          type="text"
                          placeholder="12/2025"
                          value={formData.expiry_date}
                          onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </>
                  )}

                  {formData.account_type === 'bank_account' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  {formData.account_type === 'mobile_money' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={formData.mobile_number}
                        onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={formData.is_primary}
                    onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_primary" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set as primary account
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Check size={18} />
                    Save Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAccount(false);
                      setEditingAccount(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Accounts List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No payment accounts configured. Add one to start receiving payments.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Holder Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Account Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {getAccountTypeLabel(account.account_type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {account.account_holder_name}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">
                          {account.account_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {account.bank_name && <div>Bank: {account.bank_name}</div>}
                          {account.card_last_four && <div>Last 4: {account.card_last_four}</div>}
                          {account.expiry_date && <div>Expires: {account.expiry_date}</div>}
                          {account.mobile_number && <div>Mobile: {account.mobile_number}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {account.is_primary && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                                Primary
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                              account.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(account)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              title="Edit Account"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              title="Delete Account"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Financial;
