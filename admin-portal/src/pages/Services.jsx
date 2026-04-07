import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Package
} from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [activeTab, setActiveTab] = useState('featured'); // 'featured', 'trending'
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedServiceForPromotion, setSelectedServiceForPromotion] = useState(null);
  const [promotionSettings, setPromotionSettings] = useState({
    search_priority: 0,
    category_priority: 0,
    is_enhanced_listing: false,
    has_increased_visibility: false,
    carousel_priority: 0,
    has_maximum_visibility: false,
    promotion_expires_at: ''
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);

  useEffect(() => {
    fetchData();
  }, [currentPage, categoryFilter, statusFilter, searchQuery, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query params - show ALL services but allow filtering by featured/trending
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      // Apply filters
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const [servicesRes, statsRes, categoriesRes] = await Promise.all([
        api.get(`/services?${params.toString()}`),
        api.get('/services/stats'),
        api.get('/services/categories')
      ]);
      
      setServices(servicesRes.data.services);
      setTotalPages(servicesRes.data.pagination.pages);
      setTotalServices(servicesRes.data.pagination.total);
      setStats(statsRes.data.stats);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (serviceId, currentValue) => {
    try {
      await api.patch(`/services/${serviceId}/featured`, {
        is_featured: !currentValue
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      alert('Failed to update featured status');
    }
  };

  const handleToggleTrending = async (serviceId, currentValue) => {
    try {
      await api.patch(`/services/${serviceId}/trending`, {
        is_trending: !currentValue
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle trending:', error);
      alert('Failed to update trending status');
    }
  };

  const handleUpdateStatus = async (serviceId, newStatus) => {
    try {
      await api.patch(`/services/${serviceId}/status`, {
        status: newStatus
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update service status');
    }
  };

  const handleBulkUpdate = async (action, value) => {
    if (selectedServices.length === 0) {
      alert('Please select services first');
      return;
    }
    
    if (!confirm(`Are you sure you want to ${action} ${selectedServices.length} services?`)) {
      return;
    }
    
    try {
      await api.post('/services/bulk-update', {
        service_ids: selectedServices,
        action,
        value
      });
      setSelectedServices([]);
      fetchData();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      alert('Failed to bulk update services');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/services/${serviceId}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Failed to delete service');
    }
  };

  const handleOpenPromotionModal = (service) => {
    setSelectedServiceForPromotion(service);
    setPromotionSettings({
      search_priority: service.search_priority || 0,
      category_priority: service.category_priority || 0,
      is_enhanced_listing: service.is_enhanced_listing || false,
      has_increased_visibility: service.has_increased_visibility || false,
      carousel_priority: service.carousel_priority || 0,
      has_maximum_visibility: service.has_maximum_visibility || false,
      promotion_expires_at: service.promotion_expires_at ? new Date(service.promotion_expires_at).toISOString().split('T')[0] : ''
    });
    setShowPromotionModal(true);
  };

  const handleClosePromotionModal = () => {
    setShowPromotionModal(false);
    setSelectedServiceForPromotion(null);
    setPromotionSettings({
      search_priority: 0,
      category_priority: 0,
      is_enhanced_listing: false,
      has_increased_visibility: false,
      carousel_priority: 0,
      has_maximum_visibility: false,
      promotion_expires_at: ''
    });
  };

  const handleUpdatePromotion = async () => {
    if (!selectedServiceForPromotion) return;
    
    try {
      await api.patch(`/services/${selectedServiceForPromotion.id}/promotion`, promotionSettings);
      alert('Promotion settings updated successfully!');
      handleClosePromotionModal();
      fetchData();
    } catch (error) {
      console.error('Failed to update promotion settings:', error);
      alert('Failed to update promotion settings');
    }
  };

  const toggleSelectService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map(s => s.id));
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
        <p className="text-muted-foreground">Manage home slides (featured), top ranking services, and all services</p>
      </div>

      {/* Tabs Navigation - Only Featured and Top Ranking */}
      <div className="mb-8 border-b border-border">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setActiveTab('featured');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'featured'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Star size={18} />
              <span>Home Slides</span>
              {stats && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {stats.featured_services}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('trending');
              setCurrentPage(1);
            }}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'trending'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <span>Top Ranking</span>
              {stats && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  {stats.trending_services}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Tab Description */}
      <div className="mb-6 p-4 bg-card border border-border rounded-lg">
        {activeTab === 'featured' && (
          <div className="flex items-start gap-3">
            <Star className="text-yellow-500 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Home Slides Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage services that appear in the hero carousel on the homepage. Click the star icon to add/remove services from home slides. 
                Only services marked with a star will be displayed on the homepage carousel.
              </p>
            </div>
          </div>
        )}
        {activeTab === 'trending' && (
          <div className="flex items-start gap-3">
            <TrendingUp className="text-green-500 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Top Ranking Services Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage services that appear in the "Top Ranking" section on the homepage. 
                Click the trending icon to add/remove services. Only marked services will be displayed to travelers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Services</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.total_services}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Home Slides</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.featured_services}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Star className="text-white" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Trending</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.trending_services}</h3>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Categories</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.total_categories}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Filter className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search - Show for both tabs */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {/* Bulk Actions */}
        {selectedServices.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <span className="text-sm font-medium text-foreground">
              {selectedServices.length} selected
            </span>
            {activeTab === 'featured' && (
              <>
                <button
                  onClick={() => handleBulkUpdate('featured', true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  <Star size={16} className="inline mr-2" />
                  Add to Home Slides
                </button>
                <button
                  onClick={() => handleBulkUpdate('featured', false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Remove from Home Slides
                </button>
              </>
            )}
            {activeTab === 'trending' && (
              <>
                <button
                  onClick={() => handleBulkUpdate('trending', true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <TrendingUp size={16} className="inline mr-2" />
                  Add to Trending
                </button>
                <button
                  onClick={() => handleBulkUpdate('trending', false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Remove from Trending
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Services Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedServices.length === services.length && services.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Provider</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleSelectService(service.id)}
                      className="w-4 h-4 rounded border-border"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {service.images && service.images.length > 0 ? (
                        <img
                          src={service.images[0]}
                          alt={service.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <ImageIcon size={24} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{service.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {service.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star size={12} className="mr-1" />
                              Featured
                            </span>
                          )}
                          {service.is_trending && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <TrendingUp size={12} className="mr-1" />
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{service.business_name}</p>
                      <p className="text-sm text-muted-foreground">{service.provider_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">
                      TZS {service.price?.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {service.total_bookings || 0} bookings
                      </p>
                      <p className="text-muted-foreground">
                        {service.total_favorites || 0} favorites
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={service.status}
                      onChange={(e) => handleUpdateStatus(service.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${
                        service.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : service.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFeatured(service.id, service.is_featured)}
                        className={`p-2 rounded-lg transition-colors ${
                          service.is_featured
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={service.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star size={18} fill={service.is_featured ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleToggleTrending(service.id, service.is_trending)}
                        className={`p-2 rounded-lg transition-colors ${
                          service.is_trending
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={service.is_trending ? 'Remove from trending' : 'Add to trending'}
                      >
                        <TrendingUp size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenPromotionModal(service)}
                        className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                        title="Manage promotion settings"
                      >
                        <Package size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Delete service"
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalServices)} of {totalServices} services
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Promotion Settings Modal */}
      {showPromotionModal && selectedServiceForPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Promotion Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure promotion categories for: {selectedServiceForPromotion.title}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Search Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Top Search Results (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={promotionSettings.search_priority}
                  onChange={(e) => setPromotionSettings({
                    ...promotionSettings,
                    search_priority: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values appear first in search results
                </p>
              </div>

              {/* Category Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Priority (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={promotionSettings.category_priority}
                  onChange={(e) => setPromotionSettings({
                    ...promotionSettings,
                    category_priority: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values appear first in category listings
                </p>
              </div>

              {/* Enhanced Listing */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Enhanced Listing</h3>
                  <p className="text-sm text-muted-foreground">
                    Shows larger images and more details
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promotionSettings.is_enhanced_listing}
                    onChange={(e) => setPromotionSettings({
                      ...promotionSettings,
                      is_enhanced_listing: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Increased Visibility */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Increased Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Appears in more sections across the platform
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promotionSettings.has_increased_visibility}
                    onChange={(e) => setPromotionSettings({
                      ...promotionSettings,
                      has_increased_visibility: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Carousel Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Top Carousel Placement (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={promotionSettings.carousel_priority}
                  onChange={(e) => setPromotionSettings({
                    ...promotionSettings,
                    carousel_priority: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values appear first in homepage carousel
                </p>
              </div>

              {/* Maximum Visibility */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Maximum Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Appears everywhere possible on the platform
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promotionSettings.has_maximum_visibility}
                    onChange={(e) => setPromotionSettings({
                      ...promotionSettings,
                      has_maximum_visibility: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Promotion Expiration */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Promotion Expires At (Optional)
                </label>
                <input
                  type="date"
                  value={promotionSettings.promotion_expires_at}
                  onChange={(e) => setPromotionSettings({
                    ...promotionSettings,
                    promotion_expires_at: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for no expiration
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={handleClosePromotionModal}
                className="px-6 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePromotion}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
