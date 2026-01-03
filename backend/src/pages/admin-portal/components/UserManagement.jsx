import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Edit, Trash2, Eye, 
  UserCheck, UserX, Mail, Phone, MapPin, Calendar,
  MoreVertical, X, CheckCircle, XCircle, AlertCircle,
  Building2, Star, TrendingUp, Shield
} from 'lucide-react';
import { userAPI } from '../../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterType, filterStatus, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+255 712 345 678',
          userType: 'traveler',
          isActive: true,
          isVerified: true,
          createdAt: '2024-01-15',
          totalBookings: 12,
          totalSpent: 5000000,
          avatar: null
        },
        {
          id: '2',
          firstName: 'Safari',
          lastName: 'Adventures',
          email: 'info@safariadventures.com',
          phone: '+255 713 456 789',
          userType: 'service_provider',
          isActive: true,
          isVerified: true,
          createdAt: '2024-01-10',
          totalServices: 8,
          totalBookings: 45,
          rating: 4.8,
          businessName: 'Safari Adventures Ltd',
          avatar: null
        },
        {
          id: '3',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+255 714 567 890',
          userType: 'traveler',
          isActive: true,
          isVerified: false,
          createdAt: '2024-02-20',
          totalBookings: 3,
          totalSpent: 1200000,
          avatar: null
        },
        {
          id: '4',
          firstName: 'Zanzibar',
          lastName: 'Tours',
          email: 'contact@zanzibartours.com',
          phone: '+255 715 678 901',
          userType: 'service_provider',
          isActive: false,
          isVerified: true,
          createdAt: '2024-02-01',
          totalServices: 5,
          totalBookings: 28,
          rating: 4.5,
          businessName: 'Zanzibar Tours & Travel',
          avatar: null
        },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.businessName && user.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by user type
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.userType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      } else if (filterStatus === 'verified') {
        filtered = filtered.filter(user => user.isVerified);
      } else if (filterStatus === 'unverified') {
        filtered = filtered.filter(user => !user.isVerified);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // API call to delete user
      console.log('Deleting user:', userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // API call to toggle status
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const verifyUser = async (userId) => {
    try {
      // API call to verify user
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isVerified: true } : u
      ));
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const UserModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              {user.businessName && (
                <p className="text-gray-600 flex items-center mt-1">
                  <Building2 className="h-4 w-4 mr-2" />
                  {user.businessName}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.userType === 'traveler' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.userType === 'traveler' ? 'Traveler' : 'Service Provider'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                {user.isVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">{user.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.userType === 'traveler' ? (
              <>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{user.totalBookings}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Total Spent</p>
                  <p className="text-lg font-bold text-green-600">TZS {(user.totalSpent / 1000000).toFixed(1)}M</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Services</p>
                  <p className="text-2xl font-bold text-blue-600">{user.totalServices}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Bookings</p>
                  <p className="text-2xl font-bold text-green-600">{user.totalBookings}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-amber-600 flex items-center">
                    {user.rating} <Star className="h-4 w-4 ml-1" />
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => toggleUserStatus(user.id, user.isActive)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                user.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            {!user.isVerified && (
              <button
                onClick={() => verifyUser(user.id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Verify User
              </button>
            )}
            <button
              onClick={() => handleDeleteUser(user)}
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all travelers and service providers</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Export Users</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Travelers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.userType === 'traveler').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Service Providers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {users.filter(u => u.userType === 'service_provider').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unverified</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {users.filter(u => !u.isVerified).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="traveler">Travelers</option>
            <option value="service_provider">Service Providers</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.businessName && (
                          <div className="text-sm text-gray-500">{user.businessName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.userType === 'traveler' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.userType === 'traveler' ? 'Traveler' : 'Provider'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.isVerified && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.userType === 'traveler' ? (
                      <div>
                        <div>{user.totalBookings} bookings</div>
                        <div className="text-xs">TZS {(user.totalSpent / 1000000).toFixed(1)}M</div>
                      </div>
                    ) : (
                      <div>
                        <div>{user.totalServices} services</div>
                        <div className="text-xs flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {user.rating}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showUserModal && selectedUser && (
        <UserModal user={selectedUser} onClose={() => setShowUserModal(false)} />
      )}

      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {userToDelete.firstName} {userToDelete.lastName}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;