import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Edit, Trash2, Eye, 
  CheckCircle, XCircle, AlertCircle, MapPin, Star,
  DollarSign, Users, Calendar, TrendingUp, Award,
  X, MoreVertical, Image as ImageIcon
} from 'lucide-react';
import { servicesAPI } from '../../../utils/api';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, filterCategory, filterStatus, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      const servicesData = response.services || [];
      
      // Add mock data for demonstration
      const mockServices = [
        {
          id: '1',
          title: 'Serengeti Safari Adventure',
          description: 'Experience the ultimate wildlife safari in Serengeti National Park',
          category: 'Tours & Safaris',
          price: 1500000,
          currency: 'TZS',
          location: 'Serengeti, Tanzania',
          provider: { businessName: 'Safari Adventures Ltd', rating: 4.8 },
          isActive: true,
          isFeatured: true,
          viewsCount: 1250,
          bookingsCount: 45,
          averageRating: 4.9,
          images: ['https://picsum.photos/400/300?random=1'],
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Zanzibar Beach Resort',
          description: 'Luxury beachfront accommodation with stunning ocean views',
          category: 'Accommodation',
          price: 250000,
          currency: 'TZS',
          location: 'Zanzibar, Tanzania',
          provider: { businessName: 'Zanzibar Resorts', rating: 4.6 },
          isActive: false,
          isFeatured: false,
          viewsCount: 890,
          bookingsCount: 32,
          averageRating: 4.7,
          images: ['https://picsum.photos/400/300?random=2'],
          createdAt: '2024-02-01'
        },
        {
          id: '3',
          title: 'Mount Kilimanjaro Trekking',
          description: 'Guided trek to the summit of Africa\'s highest peak',
          category: 'Activities',
          price: 2500000,
          currency: 'TZS',
          location: 'Kilimanjaro, Tanzania',
          provider: { businessName: 'Mountain Adventures', rating: 4.9 },
          isActive: true,
          isFeatured: true,
          viewsCount: 2100,
          bookingsCount: 28,
          averageRating: 5.0,
          images: ['https://picsum.photos/400/300?random=3'],
          createdAt: '2024-01-20'
        },
      ];
      
      setServices([...servicesData, ...mockServices]);
      setFilteredServices([...servicesData, ...mockServices]);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(service => service.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(service => service.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(service => !service.isActive);
      } else if (filterStatus === 'featured') {
        filtered = filtered.filter(service => service.isFeatured);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(service => !service.isActive);
      }
    }

    setFilteredServices(filtered);
  };

  const approveService = async (serviceId) => {
    try {
      await servicesAPI.update(serviceId, { isActive: true });
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, isActive: true } : s
      ));
    } catch (error) {
      console.error('Error approving service:', error);
    }
  };

  const rejectService = async (serviceId) => {
    try {
      await servicesAPI.update(serviceId, { isActive: false });
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, isActive: false } : s
      ));
    } catch (error) {
      console.error('Error rejecting service:', error);
    }
  };

  const toggleFeatured = async (serviceId, currentStatus) => {
    try {
      await servicesAPI.update(serviceId, { isFeatured: !currentStatus });
      setServices(services.map(s => 
        s.id === serviceId ? { ...s, isFeatured: !currentStatus } : s
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await servicesAPI.delete(serviceId);
      setServices(services.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const ServiceModal = ({ service, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Service Image */}
          {service.images && service.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={service.images[0]} 
                alt={service.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Service Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
            <p className="text-gray-600 mt-2">{service.description}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {service.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
              {service.isFeatured && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <DollarSign className="h-5 w-5" />
                <p className="text-xs font-medium">Price</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {service.currency} {service.price.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <Eye className="h-5 w-5" />
                <p className="text-xs font-medium">Views</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{service.viewsCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <Calendar className="h-5 w-5" />
                <p className="text-xs font-medium">Bookings</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{service.bookingsCount}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-amber-600 mb-2">
                <Star className="h-5 w-5" />
                <p className="text-xs font-medium">Rating</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{service.averageRating}</p>
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Provider Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Business Name</span>
                <span className="text-sm font-medium text-gray-900">{service.provider?.businessName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  {service.provider?.rating}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-medium text-gray-900">{service.location}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            {!service.isActive ? (
              <button
                onClick={() => {
                  approveService(service.id);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Approve Service
              </button>
            ) : (
              <button
                onClick={() => {
                  rejectService(service.id);
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Deactivate Service
              </button>
            )}
            <button
              onClick={() => {
                toggleFeatured(service.id, service.isFeatured);
                onClose();
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                service.isFeatured
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {service.isFeatured ? 'Remove Featured' : 'Make Featured'}
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this service?')) {
                  deleteService(service.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-1">Manage all services and listings</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Services</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{services.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {services.filter(s => !s.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured Services</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {services.filter(s => s.isFeatured).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Tours & Safaris">Tours & Safaris</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Transportation">Transportation</option>
            <option value="Activities">Activities</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="pending">Pending Approval</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {service.images && service.images.length > 0 && (
              <div className="relative h-48">
                <img 
                  src={service.images[0]} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                {service.isFeatured && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                  service.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {service.isActive ? 'Active' : 'Pending'}
                </div>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {service.location}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold text-gray-900">
                    {service.currency} {service.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium text-gray-900">{service.provider?.businessName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {service.viewsCount}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {service.bookingsCount}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-500" />
                    {service.averageRating}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowServiceModal(true);
                  }}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Modal */}
      {showServiceModal && selectedService && (
        <ServiceModal service={selectedService} onClose={() => setShowServiceModal(false)} />
      )}
    </div>
  );
};

export default ServiceManagement;