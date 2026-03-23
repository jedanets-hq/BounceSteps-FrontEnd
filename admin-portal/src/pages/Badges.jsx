import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Award, Trash2, Plus } from 'lucide-react';

const BadgeModal = ({ provider, onClose, onSuccess }) => {
  const [badgeType, setBadgeType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const badgeTypes = [
    { value: 'verified', label: 'Verified', color: 'blue', description: 'Identity verified provider' },
    { value: 'premium', label: 'Premium', color: 'purple', description: 'Premium service provider' },
    { value: 'top_rated', label: 'Top Rated', color: 'yellow', description: 'Highly rated by travelers' },
    { value: 'eco_friendly', label: 'Eco Friendly', color: 'green', description: 'Environmentally conscious' },
    { value: 'local_expert', label: 'Local Expert', color: 'orange', description: 'Local area specialist' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/providers/${provider.id}/badge`, {
        badgeType,
        notes
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to assign badge: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Assign Badge to {provider.business_name}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Badge Type (Only ONE badge allowed per provider)
            </label>
            <select
              value={badgeType}
              onChange={(e) => setBadgeType(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground"
              required
            >
              <option value="">Select badge type</option>
              {badgeTypes.map((badge) => (
                <option key={badge.value} value={badge.value}>
                  {badge.label} - {badge.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground"
              rows="3"
              placeholder="Add any notes about this badge assignment..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Badges = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, with_badge, without_badge
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, [search, filter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/providers', {
        params: {
          page: 1,
          limit: 100,
          search,
          hasBadge: filter === 'with_badge' ? 'true' : filter === 'without_badge' ? 'false' : ''
        }
      });

      setProviders(response.data.providers || []);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBadge = async (providerId) => {
    if (!confirm('Are you sure you want to remove this badge?')) return;
    
    try {
      await api.delete(`/providers/${providerId}/badge`);
      fetchProviders();
      alert('Badge removed successfully!');
    } catch (error) {
      alert('Failed to remove badge');
    }
  };

  const getBadgeColor = (badgeType) => {
    const colors = {
      verified: 'bg-blue-100 text-blue-800',
      premium: 'bg-yellow-100 text-yellow-800',
      top_rated: 'bg-yellow-100 text-yellow-800',
      eco_friendly: 'bg-green-100 text-green-800',
      local_expert: 'bg-orange-100 text-orange-800'
    };
    return colors[badgeType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Badge Management</h1>
        <p className="text-muted-foreground mt-1">Manage provider badges and recognition</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search providers..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="all">All Providers</option>
            <option value="with_badge">With Badge</option>
            <option value="without_badge">Without Badge</option>
          </select>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading providers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Badge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {providers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      No providers found
                    </td>
                  </tr>
                ) : (
                  providers.map((provider) => (
                    <tr key={provider.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{provider.business_name}</p>
                          <p className="text-sm text-muted-foreground">{provider.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {provider.badge_type ? (
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getBadgeColor(provider.badge_type)}`}>
                            <Award className="inline mr-1" size={12} />
                            {provider.badge_type.replace('_', ' ').toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No badge</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {provider.total_services || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {provider.rating ? `${provider.rating}/5` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProvider(provider);
                              setShowModal(true);
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                            title="Assign/Change Badge"
                          >
                            <Plus size={18} />
                          </button>
                          {provider.badge_type && (
                            <button
                              onClick={() => handleRemoveBadge(provider.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Remove Badge"
                            >
                              <Trash2 size={18} />
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
        )}
      </div>

      {/* Badge Modal */}
      {showModal && selectedProvider && (
        <BadgeModal
          provider={selectedProvider}
          onClose={() => {
            setShowModal(false);
            setSelectedProvider(null);
          }}
          onSuccess={fetchProviders}
        />
      )}
    </div>
  );
};

export default Badges;
