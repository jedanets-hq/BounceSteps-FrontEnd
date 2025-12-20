import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PartnerDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const dashboardData = {
    bookings: {
      total: 156,
      pending: 12,
      confirmed: 128,
      completed: 16
    },
    revenue: {
      total: 45680,
      commission: 6852,
      pending: 2340
    },
    ratings: {
      average: 4.8,
      total: 89,
      breakdown: {
        5: 67,
        4: 18,
        3: 3,
        2: 1,
        1: 0
      }
    }
  };

  const recentBookings = [
    {
      id: "BK001",
      traveler: "Sarah Johnson",
      service: "Luxury Safari Experience",
      date: "2025-01-15",
      status: "confirmed",
      amount: 2850
    },
    {
      id: "BK002",
      traveler: "Michael Chen",
      service: "Cultural Heritage Tour",
      date: "2025-01-18",
      status: "pending",
      amount: 1200
    },
    {
      id: "BK003",
      traveler: "Emma Williams",
      service: "Adventure Hiking Package",
      date: "2025-01-20",
      status: "confirmed",
      amount: 890
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-success bg-success/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'completed':
        return 'text-primary bg-primary/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Performance Overview</h2>
          <div className="flex items-center space-x-2">
            {['week', 'month', 'quarter']?.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {period?.charAt(0)?.toUpperCase() + period?.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bookings Card */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Bookings</h3>
              <Icon name="Calendar" size={20} className="text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-2">{dashboardData?.bookings?.total}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed:</span>
                <span className="text-success">{dashboardData?.bookings?.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="text-warning">{dashboardData?.bookings?.pending}</span>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
              <Icon name="DollarSign" size={20} className="text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-2">${dashboardData?.revenue?.total?.toLocaleString()}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission:</span>
                <span className="text-foreground">${dashboardData?.revenue?.commission?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending:</span>
                <span className="text-warning">${dashboardData?.revenue?.pending?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Ratings Card */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
              <Icon name="Star" size={20} className="text-warning" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-2xl font-bold text-foreground">{dashboardData?.ratings?.average}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5]?.map((star) => (
                  <Icon
                    key={star}
                    name="Star"
                    size={16}
                    className={star <= Math.floor(dashboardData?.ratings?.average) ? 'text-warning fill-current' : 'text-muted-foreground'}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {dashboardData?.ratings?.total} reviews
            </div>
          </div>
        </div>
      </div>
      {/* Recent Bookings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Recent Bookings</h2>
          <Button variant="outline" size="sm" onClick={() => alert('Opening all bookings...')}>
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {recentBookings?.map((booking) => (
            <div key={booking?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{booking?.traveler}</h3>
                  <p className="text-sm text-muted-foreground">{booking?.service}</p>
                  <p className="text-xs text-muted-foreground">{booking?.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">${booking?.amount}</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking?.status)}`}>
                  {booking?.status}
                </div>
                {booking?.status === 'pending' && (
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => alert(`Confirming booking ${booking?.id}...`)}
                      className="text-xs px-2 py-1"
                    >
                      Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => alert(`Rejecting booking ${booking?.id}...`)}
                      className="text-xs px-2 py-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;