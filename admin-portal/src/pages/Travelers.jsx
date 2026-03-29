import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Eye, UserX, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const Travelers = () => {
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchTravelers();
  }, [pagination.page, search, status]);

  const fetchTravelers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search,
          userType: 'traveler',
          status
        }
      });

      setTravelers(response.data.users);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Failed to fetch travelers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    if (!confirm('Suspend this traveler?')) return;
    try {
      await api.post(`/users/${userId}/suspend`);
      fetchTravelers();
    } catch (error) {
      alert('Failed to suspend traveler');
    }
  };

  const handleRestore = async (userId) => {
    try {
      await api.post(`/users/${userId}/restore`);
      fetchTravelers();
    } catch (error) {
      alert('Failed to restore traveler');
    }
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Travelers</h1>
        <p className="text-muted-foreground mt-1">Manage traveler accounts</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search travelers..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading travelers...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Traveler</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {travelers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                        No travelers found
                      </td>
                    </tr>
                  ) : (
                    travelers.map((traveler) => (
                      <tr key={traveler.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {traveler.first_name} {traveler.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{traveler.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            traveler.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {traveler.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {traveler.total_bookings || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(traveler.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {traveler.is_active ? (
                              <button
                                onClick={() => handleSuspend(traveler.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Suspend Traveler"
                              >
                                <UserX size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(traveler.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Restore Traveler"
                              >
                                <RotateCcw size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} travelers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-foreground">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Travelers;