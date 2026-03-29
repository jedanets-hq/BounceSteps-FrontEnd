import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, CheckCircle, XCircle, Eye, Clock, CreditCard, DollarSign } from 'lucide-react';

const Verification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, unpaid, all
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchVerificationRequests();
  }, [filter]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/payments/verification-requests', {
        params: { status: filter }
      });

      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApprove = async (providerId) => {
    if (!confirm('Approve this provider verification?')) return;
    
    try {
      await api.post(`/admin/providers/${providerId}/verify`);
      fetchVerificationRequests();
      alert('Provider verified successfully!');
    } catch (error) {
      alert('Failed to verify provider');
    }
  };

  const handleReject = async (providerId) => {
    if (!confirm('Reject this provider verification?')) return;
    
    try {
      await api.post(`/admin/providers/${providerId}/unverify`, {
        reason: 'Verification rejected by admin'
      });
      fetchVerificationRequests();
      alert('Verification rejected');
    } catch (error) {
      alert('Failed to reject verification');
    }
  };

  const getPaymentStatusBadge = (request) => {
    if (!request.payment_id) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          No Payment
        </span>
      );
    }
    
    if (request.is_verified) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Paid & Verified
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        Paid - Pending Approval
      </span>
    );
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Verification Requests</h1>
        <p className="text-muted-foreground mt-1">Review and approve provider verification requests with payment tracking</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Clock className="inline mr-2" size={16} />
            Paid - Pending Approval
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <CheckCircle className="inline mr-2" size={16} />
            Approved & Verified
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unpaid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <XCircle className="inline mr-2" size={16} />
            Not Paid
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Requests
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      No verification requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.provider_id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{request.business_name}</p>
                          <p className="text-sm text-muted-foreground">{request.provider_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {request.total_services || 0}
                      </td>
                      <td className="px-6 py-4">
                        {request.payment_id ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {request.currency} {parseFloat(request.payment_amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.payment_date).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No payment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(request)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {request.payment_id && !request.is_verified ? (
                            <>
                              <button
                                onClick={() => handleApprove(request.provider_id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Approve Verification"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(request.provider_id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Reject Verification"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          ) : request.is_verified ? (
                            <button
                              onClick={() => handleReject(request.provider_id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Revoke Verification"
                            >
                              <XCircle size={18} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Verification Request Details</h3>
              <button onClick={() => setShowDetailsModal(false)}>
                <XCircle size={24} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Provider Information */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Provider Information</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Name:</span>
                    <span className="font-medium">{selectedRequest.business_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{selectedRequest.provider_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{selectedRequest.provider_phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Type:</span>
                    <span className="font-medium capitalize">{selectedRequest.business_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{selectedRequest.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Services:</span>
                    <span className="font-medium">{selectedRequest.total_services}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedRequest.payment_id ? (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard size={18} />
                    Payment Information
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {selectedRequest.currency} {parseFloat(selectedRequest.payment_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Date:</span>
                      <span className="font-medium">{new Date(selectedRequest.payment_date).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Ref:</span>
                      <span className="font-mono text-sm">{selectedRequest.transaction_reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider Card:</span>
                      <span className="font-mono">{selectedRequest.provider_card_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cardholder:</span>
                      <span className="font-medium">{selectedRequest.provider_card_holder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{selectedRequest.payment_status}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <DollarSign size={18} />
                    No payment received yet. Provider needs to pay verification fee.
                  </p>
                </div>
              )}

              {/* Admin Account Information */}
              {selectedRequest.payment_id && selectedRequest.admin_account_holder && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Payment Received To</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Holder:</span>
                      <span className="font-medium">{selectedRequest.admin_account_holder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Type:</span>
                      <span className="font-medium capitalize">{selectedRequest.admin_account_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Number:</span>
                      <span className="font-mono">{selectedRequest.admin_account_number}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Period */}
              {selectedRequest.start_date && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Verification Period</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">{new Date(selectedRequest.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span className="font-medium">{new Date(selectedRequest.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.payment_id && !selectedRequest.is_verified && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.provider_id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Verification
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.provider_id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;
