import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const StatCard = ({ title, value, growth, icon: Icon, color, subtitle }) => {
  const isPositive = growth >= 0;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {growth !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(growth)}% vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'user_registered':
        return <Users className="text-primary" size={20} />;
      case 'booking_created':
        return <CheckCircle className="text-success" size={20} />;
      case 'service_created':
        return <Building2 className="text-secondary" size={20} />;
      default:
        return <Activity className="text-muted-foreground" size={20} />;
    }
  };

  const getLabel = () => {
    switch (item.type) {
      case 'user_registered':
        return 'New User Registration';
      case 'booking_created':
        return 'New Booking';
      case 'service_created':
        return 'New Service Added';
      default:
        return item.type;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
      <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center flex-shrink-0 border border-border">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground truncate">{item.email || item.user_type}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
            {getLabel()}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(item.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get(`/dashboard/stats?period=${period}`),
        api.get('/dashboard/activity?limit=10')
      ]);

      setStats(statsRes.data.stats);
      setActivity(activityRes.data.activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to iSafari Admin Portal</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2.5 bg-card border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground font-medium shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="alltime">All Time</option>
        </select>
      </div>

      {/* Stats Grid - 3 cards only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.users?.total?.toLocaleString() || '0'}
          growth={stats?.users?.growth}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="Travelers & Providers"
        />
        <StatCard
          title="Service Providers"
          value={stats?.providers?.total?.toLocaleString() || '0'}
          growth={stats?.providers?.growth}
          icon={Building2}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${stats?.providers?.verified || 0} verified`}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.bookings?.total?.toLocaleString() || '0'}
          growth={stats?.bookings?.growth}
          icon={Activity}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle={`${stats?.bookings?.completed || 0} completed`}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
              <p className="text-sm text-muted-foreground mt-1">Latest platform activities</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {activity.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-muted-foreground mb-3" size={48} />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item, index) => (
                <ActivityItem key={index} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
