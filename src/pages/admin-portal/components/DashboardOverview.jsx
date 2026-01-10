import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Calendar, DollarSign, TrendingUp, 
  ArrowUp, ArrowDown, Activity, Eye, Star, MapPin,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { servicesAPI, bookingsAPI, paymentsAPI, userAPI } from '../../../utils/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTravelers: 0,
    totalProviders: 0,
    totalServices: 0,
    activeServices: 0,
    pendingServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real analytics data from admin endpoint
      const analyticsResponse = await fetch('http://localhost:5000/api/admin/analytics/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        
        if (analyticsData.success && analyticsData.stats) {
          setStats({
            totalUsers: analyticsData.stats.totalUsers || 0,
            totalTravelers: analyticsData.stats.totalTravelers || 0,
            totalProviders: analyticsData.stats.totalProviders || 0,
            totalServices: analyticsData.stats.activeServices || 0,
            activeServices: analyticsData.stats.activeServices || 0,
            pendingServices: analyticsData.stats.pendingApprovals || 0,
            totalBookings: analyticsData.stats.totalBookings || 0,
            pendingBookings: analyticsData.stats.pendingApprovals || 0,
            completedBookings: analyticsData.stats.completedToday || 0,
            totalRevenue: analyticsData.stats.monthlyRevenue || 0,
            monthlyRevenue: analyticsData.stats.monthlyRevenue || 0,
            revenueGrowth: 12.5,
          });
          
          // Set recent activities from API
          if (analyticsData.recentActivity) {
            setRecentActivities(analyticsData.recentActivity.slice(0, 5));
          }
          
          console.log('✅ Dashboard data loaded successfully');
        }
      } else {
        // Fallback to individual API calls
        const [servicesRes, bookingsRes, paymentsRes] = await Promise.all([
          servicesAPI.getAll(),
          bookingsAPI.getAll(),
          paymentsAPI.getAll(),
        ]);

        const services = servicesRes.services || [];
        const bookings = bookingsRes.bookings || [];
        const payments = paymentsRes.payments || [];

        setStats({
          totalUsers: 0,
          totalTravelers: 0,
          totalProviders: 0,
          totalServices: services.length,
          activeServices: services.filter(s => s.is_active).length,
          pendingServices: services.filter(s => !s.is_active).length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
          monthlyRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
          revenueGrowth: 0,
        });
      }

      setRecentActivities([
        { id: 1, type: 'booking', message: 'New booking for Serengeti Safari Tour', time: '2 mins ago', status: 'success' },
        { id: 2, type: 'service', message: 'New service submitted for approval', time: '15 mins ago', status: 'pending' },
        { id: 3, type: 'payment', message: 'Payment received: TZS 500,000', time: '1 hour ago', status: 'success' },
        { id: 4, type: 'user', message: 'New service provider registered', time: '2 hours ago', status: 'info' },
        { id: 5, type: 'review', message: 'New 5-star review submitted', time: '3 hours ago', status: 'success' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueData = [
    { month: 'Jan', revenue: 25000000, bookings: 120 },
    { month: 'Feb', revenue: 28000000, bookings: 145 },
    { month: 'Mar', revenue: 32000000, bookings: 168 },
    { month: 'Apr', revenue: 35000000, bookings: 182 },
    { month: 'May', revenue: 38000000, bookings: 195 },
    { month: 'Jun', revenue: 45000000, bookings: 220 },
  ];

  const categoryData = [
    { name: 'Tours & Safaris', value: 45, color: '#2C5F41' },
    { name: 'Accommodation', value: 25, color: '#4A90A4' },
    { name: 'Transportation', value: 15, color: '#D4A574' },
    { name: 'Activities', value: 10, color: '#059669' },
    { name: 'Others', value: 5, color: '#6B7280' },
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with iSafari today.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={8.2}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Services"
          value={stats.activeServices}
          change={5.4}
          icon={Package}
          color="bg-green-600"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          change={12.3}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`TZS ${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
          change={stats.revenueGrowth}
          icon={DollarSign}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `TZS ${(value / 1000000).toFixed(1)}M`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2C5F41" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-sm text-primary hover:text-primary/80">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                <div className={`p-2 rounded-lg ${
                  activity.status === 'success' ? 'bg-green-100' :
                  activity.status === 'pending' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {activity.status === 'success' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                   activity.status === 'pending' ? <AlertCircle className="h-5 w-5 text-yellow-600" /> :
                   <Activity className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Travelers</span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalTravelers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service Providers</span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalProviders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Services</span>
              <span className="text-sm font-semibold text-yellow-600">{stats.pendingServices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Bookings</span>
              <span className="text-sm font-semibold text-yellow-600">{stats.pendingBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Bookings</span>
              <span className="text-sm font-semibold text-green-600">{stats.completedBookings}</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                <span className="text-sm font-bold text-primary">TZS {(stats.totalRevenue / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;