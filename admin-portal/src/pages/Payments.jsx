import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, DollarSign, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [pagination.page, status]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status
        }
      });

      setPayments(response.data.payments);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/payments/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleRefund = async (bookingId) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;

    try {
      await api.post(`/payments/${bookingId}/refund`, { reason });
      fetchPayments();
      fetchStats();
      alert('Refund processed successfully');
    } catch (error) {
      alert('Failed to process refund');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      refunded: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      failed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor transactions and process refunds</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              TZS {parseFloat(stats.revenue?.total_revenue || 0).toLocaleString()}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Transactions</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.revenue?.total_transactions || 0}
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Transaction</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              TZS {parseFloat(stats.revenue?.avg_transaction || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Traveler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">#{payment.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {payment.traveler_first_name} {payment.traveler_last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{payment.traveler_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {payment.business_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{payment.service_title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{payment.service_category}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        TZS {parseFloat(payment.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {payment.payment_status === 'paid' && (
                          <button
                            onClick={() => handleRefund(payment.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Process Refund"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} payments
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
